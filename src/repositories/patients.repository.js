'use strict';

/**
 * src/repositories/patients.repository.js
 *
 * Data-access for patients. All SQL is parameterized and loaded from
 * database/queries/patients/ and database/queries/billing/.
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listPatients(q, from, to, limit, offset) {
  const [rows] = await execute(pool, 'patients/001_list_patients.sql', [
    q, q, q, q, from, from, to, to, limit, offset,
  ]);
  return rows;
}

async function showPatient(patientId) {
  const [rows] = await execute(pool, 'patients/002_show_patient.sql', [patientId]);
  return rows[0] || null;
}

async function patientAppointments(patientId, limit, offset) {
  const [rows] = await execute(pool, 'patients/003_patient_appointments.sql', [
    patientId, limit, offset,
  ]);
  return rows;
}

async function patientBills(patientId, limit, offset) {
  const [rows] = await execute(pool, 'patients/004_patient_bills.sql', [
    patientId, limit, offset,
  ]);
  return rows;
}

async function patientMedicalRecords(patientId, limit, offset) {
  const [rows] = await execute(pool, 'patients/005_patient_medical_records.sql', [
    patientId, limit, offset,
  ]);
  return rows;
}

async function createPatient(data) {
  const [result] = await execute(pool, 'billing/036_create_patient.sql', [
    data.full_name, data.gender, data.date_of_birth, data.phone,
    data.email, data.address, data.blood_group,
  ]);
  return result.insertId;
}

async function updatePatient(patientId, data) {
  await execute(pool, 'billing/037_update_patient.sql', [
    data.full_name, data.gender, data.date_of_birth, data.phone,
    data.email, data.address, data.blood_group, patientId,
  ]);
}

async function countPatients(q, from, to) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM patients
     WHERE (? IS NULL
            OR full_name LIKE CONCAT('%', ?, '%')
            OR phone LIKE CONCAT('%', ?, '%')
            OR email LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR created_at >= ?)
       AND (? IS NULL OR created_at < ?)`,
    [q, q, q, q, from, from, to, to]
  );
  return Number(rows[0].c);
}

module.exports = {
  listPatients, showPatient, patientAppointments, patientBills,
  patientMedicalRecords, createPatient, updatePatient, countPatients,
};