'use strict';

/**
 * src/repositories/medical-records.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function showForAppointment(appointmentId) {
  const [rows] = await execute(pool, 'billing/026_show_medical_record.sql', [appointmentId]);
  return rows[0] || null;
}

async function showRecord(recordId) {
  const [rows] = await execute(pool, 'billing/027_show_medical_record_by_id.sql', [recordId]);
  return rows[0] || null;
}

async function recordExistsForAppointment(appointmentId) {
  const [rows] = await pool.execute(
    'SELECT record_id FROM medical_records WHERE appointment_id = ?',
    [appointmentId]
  );
  return rows.length > 0;
}

async function createMedicalRecord(data) {
  const [result] = await execute(pool, 'billing/024_create_medical_record.sql', [
    data.appointment_id, data.diagnosis, data.treatment, data.notes, data.recorded_by,
  ]);
  return result.insertId;
}

async function updateMedicalRecord(recordId, data) {
  await execute(pool, 'billing/025_update_medical_record.sql', [
    data.diagnosis, data.treatment, data.notes, recordId,
  ]);
}

module.exports = {
  showForAppointment, showRecord, recordExistsForAppointment,
  createMedicalRecord, updateMedicalRecord,
};