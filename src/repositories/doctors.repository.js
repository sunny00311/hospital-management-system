'use strict';

/**
 * src/repositories/doctors.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listDoctors(q, departmentId, status, limit, offset) {
  const [rows] = await execute(pool, 'doctors/001_list_doctors.sql', [
    q, q, q, departmentId, departmentId, status, status, status, limit, offset,
  ]);
  return rows;
}

async function showDoctor(doctorId) {
  const [rows] = await execute(pool, 'doctors/002_show_doctor.sql', [doctorId]);
  return rows[0] || null;
}

async function doctorAppointments(doctorId, from, to, limit, offset) {
  const [rows] = await execute(pool, 'doctors/003_doctor_appointments.sql', [
    doctorId, from, from, to, to, limit, offset,
  ]);
  return rows;
}

async function doctorPrescriptions(doctorId, from, to, limit, offset) {
  const [rows] = await execute(pool, 'doctors/004_doctor_prescriptions.sql', [
    doctorId, from, from, to, to, limit, offset,
  ]);
  return rows;
}

async function doctorRevenue(doctorId, from, to) {
  const [rows] = await execute(pool, 'doctors/005_doctor_revenue.sql', [
    doctorId, doctorId, from, from, to, to,
  ]);
  return rows;
}

async function createDoctor(data) {
  const [result] = await execute(pool, 'billing/033_create_doctor.sql', [
    data.department_id, data.full_name, data.specialization, data.phone,
    data.email, data.consultation_fee, data.is_active,
  ]);
  return result.insertId;
}

async function updateDoctor(doctorId, data) {
  await execute(pool, 'billing/034_update_doctor.sql', [
    data.department_id, data.full_name, data.specialization, data.phone,
    data.email, data.consultation_fee, data.is_active, doctorId,
  ]);
}

async function updateDoctorStatus(doctorId, isActive) {
  await execute(pool, 'billing/035_update_doctor_status.sql', [isActive, doctorId]);
}

async function countDoctors(q, departmentId, status) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM doctors d
     JOIN departments dept ON dept.department_id = d.department_id
     WHERE (? IS NULL
            OR d.full_name LIKE CONCAT('%', ?, '%')
            OR d.specialization LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR d.department_id = ?)
       AND (? IS NULL
            OR (? = 'active' AND d.is_active = 1)
            OR (? = 'inactive' AND d.is_active = 0))`,
    [q, q, q, departmentId, departmentId, status, status, status]
  );
  return Number(rows[0].c);
}

module.exports = {
  listDoctors, showDoctor, doctorAppointments, doctorPrescriptions,
  doctorRevenue, createDoctor, updateDoctor, updateDoctorStatus, countDoctors,
};