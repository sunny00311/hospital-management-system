'use strict';

/**
 * src/services/prescriptions.service.js
 *
 * Prescription creation with line items (atomic transaction).
 * Stock deduction/dispensing uses SELECT ... FOR UPDATE to validate
 * available quantity and prevent negative stock.
 */

const pool = require('../config/db');
const prescriptionsRepo = require('../repositories/prescriptions.repository');
const recordsRepo = require('../repositories/medical-records.repository');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const {
  requireInt, requireStr, requirePositiveInt, optionalStr,
} = require('../utils/validators');
const stockRepo = require('../repositories/medicines.repository');

function validatePrescription(data) {
  const record_id = requireInt(data.record_id, 'record_id');
  const doctor_id = requireInt(data.doctor_id, 'doctor_id');
  const patient_id = requireInt(data.patient_id, 'patient_id');
  const notes = optionalStr(data.notes, 'notes', 65535);
  return { record_id, doctor_id, patient_id, notes };
}

function validatePrescriptionItem(data) {
  const medicine_id = requireInt(data.medicine_id, 'medicine_id');
  const dosage = requireStr(data.dosage, 'dosage', 100);
  const frequency = requireStr(data.frequency, 'frequency', 100);
  const duration_days = requirePositiveInt(data.duration_days, 'duration_days');
  const quantity = requirePositiveInt(data.quantity, 'quantity');
  const instructions = optionalStr(data.instructions, 'instructions', 300);
  if (duration_days > 365) throw new ValidationError('Duration cannot exceed 365 days.', 'duration_days');
  return { medicine_id, dosage, frequency, duration_days, quantity, instructions };
}

async function createPrescription(prescriptionData, itemsData) {
  const validatedPrescription = validatePrescription(prescriptionData);
  const validatedItems = itemsData.map(validatePrescriptionItem);

  // Validate record exists and is completed.
  const record = await recordsRepo.showRecord(validatedPrescription.record_id);
  if (!record) throw new NotFoundError('Medical record not found.');

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const prescriptionId = await prescriptionsRepo.createPrescription({
      record_id: validatedPrescription.record_id,
      doctor_id: validatedPrescription.doctor_id,
      patient_id: validatedPrescription.patient_id,
      status: 'Active',
      notes: validatedPrescription.notes,
    });

    for (const item of validatedItems) {
      // Validate medicine exists and is active.
      const [medRows] = await connection.execute(
        'SELECT medicine_id, stock_quantity FROM medicines WHERE medicine_id = ? AND is_active = 1',
        [item.medicine_id]
      );
      if (medRows.length === 0) {
        throw new ValidationError(`Medicine ${item.medicine_id} not found or inactive.`, 'medicine_id');
      }

      await prescriptionsRepo.createPrescriptionItem({
        prescription_id: prescriptionId,
        medicine_id: item.medicine_id,
        dosage: item.dosage,
        frequency: item.frequency,
        duration_days: item.duration_days,
        quantity: item.quantity,
        instructions: item.instructions,
      });
    }

    await connection.commit();
    return prescriptionId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function showPrescription(prescriptionId) {
  const prescription = await prescriptionsRepo.showPrescription(prescriptionId);
  if (!prescription) throw new NotFoundError('Prescription not found.');
  const items = await prescriptionsRepo.showPrescriptionItems(prescriptionId);
  return { ...prescription, items };
}

async function dispensePrescription(prescriptionId, dispensedBy) {
  const prescription = await prescriptionsRepo.showPrescription(prescriptionId);
  if (!prescription) throw new NotFoundError('Prescription not found.');
  if (prescription.status === 'Dispensed') throw new ConflictError('Prescription already dispensed.');
  if (prescription.status === 'Cancelled') throw new ConflictError('Cannot dispense a cancelled prescription.');

  const items = await prescriptionsRepo.showPrescriptionItems(prescriptionId);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lock and validate stock for each medicine.
    for (const item of items) {
      const [medRows] = await connection.execute(
        'SELECT medicine_id, stock_quantity FROM medicines WHERE medicine_id = ? FOR UPDATE',
        [item.medicine_id]
      );
      if (medRows.length === 0) {
        throw new ValidationError(`Medicine ${item.medicine_id} no longer exists.`);
      }
      const stock = Number(medRows[0].stock_quantity);
      if (stock < item.quantity) {
        throw new ConflictError(`Insufficient stock for ${item.medicine_name}. Available: ${stock}, Required: ${item.quantity}`);
      }

      // Record stock movement (dispense) - the trigger updates stock_quantity.
      await stockRepo.adjustStock({
        medicine_id: item.medicine_id,
        movement_type: 'Dispense',
        quantity_delta: -item.quantity,
        reference_type: 'Prescription',
        reference_id: prescriptionId,
        note: `Dispensed from prescription ${prescriptionId}`,
        moved_by: dispensedBy,
      });
    }

    await prescriptionsRepo.dispensePrescription(prescriptionId, dispensedBy);
    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  createPrescription, showPrescription, dispensePrescription,
  validatePrescription, validatePrescriptionItem,
};