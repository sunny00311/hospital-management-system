'use strict';

/**
 * src/services/bills.service.js
 *
 * Bill creation with line items (atomic transaction).
 * Recalculates totals from trusted bill_items only.
 */

const pool = require('../config/db');
const billsRepo = require('../repositories/bills.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');
const {
  requireInt, requireStr, requireDecimal, optionalStr, requireDate,
  requirePositiveInt, optionalEmail,
} = require('../utils/validators');
const { generateBillNumber } = require('../utils/bill-number');
const { generatePaymentNumber } = require('../utils/payment-number');

function validateBill(data) {
  const patient_id = requireInt(data.patient_id, 'patient_id');
  const appointment_id = data.appointment_id ? requireInt(data.appointment_id, 'appointment_id') : null;
  const bill_date = requireDate(data.bill_date, 'bill_date');
  const due_date = data.due_date ? requireDate(data.due_date, 'due_date') : null;
  if (due_date && due_date < bill_date) {
    throw new ValidationError('Due date cannot be before bill date.', 'due_date');
  }
  return { patient_id, appointment_id, bill_date, due_date };
}

function validateBillItem(data) {
  const description = requireStr(data.description, 'description', 255);
  const quantity = requirePositiveInt(data.quantity, 'quantity');
  const unit_price = requireDecimal(data.unit_price, 'unit_price');
  const medicine_id = data.medicine_id ? requireInt(data.medicine_id, 'medicine_id') : null;
  return { description, quantity, unit_price, medicine_id };
}

async function listBills(q, from, to, status, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    billsRepo.listBills(q, from, to, status, limit, offset),
    billsRepo.countBills(q, from, to, status),
  ]);
  return { rows, count, page, limit };
}

async function showBill(billId) {
  const bill = await billsRepo.showBill(billId);
  if (!bill) throw new NotFoundError('Bill not found.');
  const items = await billsRepo.billItems(billId);
  const payments = await billsRepo.billPayments(billId);
  return { ...bill, items, payments };
}

async function createBill(data, items) {
  const validated = validateBill(data);
  const validatedItems = items.map(validateBillItem);

  // Validate patient exists.
  const [patientRows] = await pool.execute(
    'SELECT patient_id FROM patients WHERE patient_id = ?',
    [validated.patient_id]
  );
  if (patientRows.length === 0) throw new ValidationError('Patient not found.', 'patient_id');

  // If appointment_id provided, validate it exists and belongs to patient.
  if (validated.appointment_id) {
    const [apptRows] = await pool.execute(
      'SELECT appointment_id FROM appointments WHERE appointment_id = ? AND patient_id = ?',
      [validated.appointment_id, validated.patient_id]
    );
    if (apptRows.length === 0) throw new ValidationError('Appointment not found for this patient.', 'appointment_id');
  }

  const billNumber = await generateBillNumber();

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const billId = await billsRepo.createBill({
      bill_number: billNumber,
      patient_id: validated.patient_id,
      appointment_id: validated.appointment_id,
      status: 'Draft',
      total_amount: 0.00,
      paid_amount: 0.00,
      outstanding_amount: 0.00,
      bill_date: validated.bill_date,
      due_date: validated.due_date,
      created_by: data.created_by || null,
    });

    for (const item of validatedItems) {
      await billsRepo.createBillItems(billId, [item]);
    }

    // Recompute totals from line items.
    await billsRepo.recomputeTotals(billId);

    // Update status to Pending (bill finalized).
    await billsRepo.updateBillStatus(billId, 'Pending');

    await connection.commit();
    return billId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateBill(billId, data, items) {
  const bill = await billsRepo.showBill(billId);
  if (!bill) throw new NotFoundError('Bill not found.');

  // Business rule: cannot edit a paid or partially paid bill.
  if (bill.status !== 'Draft' && bill.status !== 'Pending') {
    throw new ValidationError('Cannot edit a bill that has received payments or been finalized.');
  }

  const validated = validateBill(data);
  const validatedItems = items ? items.map(validateBillItem) : [];

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await billsRepo.updateBill(billId, validated);

    // Replace line items if provided.
    if (validatedItems.length > 0) {
      await billsRepo.deleteBillItems(billId);
      for (const item of validatedItems) {
        await billsRepo.createBillItems(billId, [item]);
      }
    }

    // Recompute totals.
    await billsRepo.recomputeTotals(billId);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function cancelBill(billId) {
  const bill = await billsRepo.showBill(billId);
  if (!bill) throw new NotFoundError('Bill not found.');
  if (bill.paid_amount > 0) {
    throw new ValidationError('Cannot cancel a bill that has received payments.');
  }
  await billsRepo.cancelBill(billId);
}

module.exports = {
  listBills, showBill, createBill, updateBill, cancelBill,
  validateBill, validateBillItem,
};