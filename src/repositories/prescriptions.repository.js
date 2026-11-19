'use strict';

/**
 * src/repositories/prescriptions.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function createPrescription(data) {
  const [result] = await execute(pool, 'billing/020_create_prescription.sql', [
    data.record_id, data.doctor_id, data.patient_id, data.status || 'Active', data.notes,
  ]);
  return result.insertId;
}

async function createPrescriptionItem(data) {
  await execute(pool, 'billing/021_create_prescription_item.sql', [
    data.prescription_id, data.medicine_id, data.dosage, data.frequency,
    data.duration_days, data.quantity, data.instructions,
  ]);
}

async function showPrescription(prescriptionId) {
  const [rows] = await execute(pool, 'billing/028_show_prescription.sql', [prescriptionId]);
  return rows[0] || null;
}

async function showPrescriptionItems(prescriptionId) {
  const [rows] = await execute(pool, 'billing/029_show_prescription_items.sql', [prescriptionId]);
  return rows;
}

async function dispensePrescription(prescriptionId, dispensedBy) {
  await execute(pool, 'billing/022_dispense_prescription.sql', [
    prescriptionId, dispensedBy, prescriptionId,
  ]);
}

async function showDispensing(prescriptionId) {
  const [rows] = await execute(pool, 'billing/030_show_prescription_dispensing.sql', [prescriptionId]);
  return rows[0] || null;
}

module.exports = {
  createPrescription, createPrescriptionItem, showPrescription,
  showPrescriptionItems, dispensePrescription, showDispensing,
};