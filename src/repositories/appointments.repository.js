'use strict';

/**
 * src/repositories/appointments.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listAppointments(from, to, patientId, doctorId, departmentId, status, limit, offset) {
  const [rows] = await execute(pool, 'appointments/001_list_appointments.sql', [
    from, from, to, to, patientId, patientId, doctorId, doctorId,
    departmentId, departmentId, status, status, limit, offset,
  ]);
  return rows;
}

async function showAppointment(appointmentId) {
  const [rows] = await execute(pool, 'appointments/002_show_appointment.sql', [appointmentId]);
  return rows[0] || null;
}

async function checkConflict(doctorId, start, end) {
  const [rows] = await execute(pool, 'appointments/003_check_conflict.sql', [
    doctorId, start, end,
  ]);
  return Number(rows[0].conflict_count) > 0;
}

async function appointmentStatusCounts(from, to) {
  const [rows] = await execute(pool, 'appointments/004_appointment_status_counts.sql', [from, to]);
  return rows;
}

async function todayAppointments(todayStart, todayEnd) {
  const [rows] = await execute(pool, 'appointments/005_today_appointments.sql', [todayStart, todayEnd]);
  return rows;
}

async function departmentTotals(from, to) {
  const [rows] = await execute(pool, 'appointments/006_department_totals.sql', [from, to]);
  return rows;
}

async function createAppointment(data) {
  const [result] = await execute(pool, 'billing/038_create_appointment.sql', [
    data.patient_id, data.doctor_id, data.appointment_at, data.duration_minutes,
    data.reason, data.notes,
  ]);
  return result.insertId;
}

async function updateStatus(appointmentId, status) {
  await execute(pool, 'billing/039_update_appointment_status.sql', [status, appointmentId]);
}

async function countAppointments(from, to, patientId, doctorId, departmentId, status) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM appointments a
     JOIN doctors d ON d.doctor_id = a.doctor_id
     WHERE (? IS NULL OR a.appointment_at >= ?)
       AND (? IS NULL OR a.appointment_at < ?)
       AND (? IS NULL OR a.patient_id = ?)
       AND (? IS NULL OR a.doctor_id = ?)
       AND (? IS NULL OR d.department_id = ?)
       AND (? IS NULL OR a.status = ?)`,
    [from, from, to, to, patientId, patientId, doctorId, doctorId, departmentId, departmentId, status, status]
  );
  return Number(rows[0].c);
}

module.exports = {
  listAppointments, showAppointment, checkConflict, appointmentStatusCounts,
  todayAppointments, departmentTotals, createAppointment, updateStatus,
  countAppointments,
};