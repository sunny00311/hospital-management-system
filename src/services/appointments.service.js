'use strict';

/**
 * src/services/appointments.service.js
 *
 * Business rules for appointment booking. Implements duration-aware conflict
 * handling transactionally (pool connection, begin/commit/rollback, release in
 * finally) and row locking so concurrent booking attempts cannot both pass.
 */

const pool = require('../config/db');
const appointmentsRepo = require('../repositories/appointments.repository');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const {
  requireInt, optionalStr, requireDateTime, requirePositiveInt, requireEnum,
} = require('../utils/validators');
const money = require('../utils/money');

const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];
const ALLOWED_TRANSITIONS = {
  Scheduled: ['Completed', 'Cancelled', 'No-show'],
  Completed: ['Scheduled', 'Cancelled', 'No-show'],
  Cancelled: ['Scheduled'],
  'No-show': ['Scheduled', 'Cancelled'],
};

async function listAppointments(from, to, patientId, doctorId, departmentId, status, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    appointmentsRepo.listAppointments(from, to, patientId, doctorId, departmentId, status, limit, offset),
    appointmentsRepo.countAppointments(from, to, patientId, doctorId, departmentId, status),
  ]);
  return { rows, count, page, limit };
}

function validateAppointment(data) {
  const patient_id = requireInt(data.patient_id, 'patient_id');
  const doctor_id = requireInt(data.doctor_id, 'doctor_id');
  const appointment_at = requireDateTime(data.appointment_at, 'appointment_at');
  const duration_minutes = requirePositiveInt(data.duration_minutes, 'duration_minutes');
  const reason = optionalStr(data.reason, 'reason', 500);
  const notes = optionalStr(data.notes, 'notes', 1000);
  if (duration_minutes > 240) {
    throw new ValidationError('Duration cannot exceed 240 minutes.');
  }
  return { patient_id, doctor_id, appointment_at, duration_minutes, reason, notes };
}

async function showAppointment(appointmentId) {
  const appointment = await appointmentsRepo.showAppointment(appointmentId);
  if (!appointment) throw new NotFoundError('Appointment not found.');
  return appointment;
}

async function bookAppointment(data) {
  const validated = validateAppointment(data);

  // Validate patient exists.
  const [patientRows] = await pool.execute(
    'SELECT patient_id FROM patients WHERE patient_id = ?',
    [validated.patient_id]
  );
  if (patientRows.length === 0) throw new ValidationError('Patient not found.', 'patient_id');

  // Validate doctor exists and active.
  const [doctorRows] = await pool.execute(
    'SELECT doctor_id FROM doctors WHERE doctor_id = ? AND is_active = 1',
    [validated.doctor_id]
  );
  if (doctorRows.length === 0) throw new ValidationError('Doctor not found or inactive.', 'doctor_id');

  // Appointment time must be in the future.
  const now = new Date();
  const apptTime = new Date(validated.appointment_at);
  if (apptTime <= now) throw new ValidationError('Appointment time must be in the future.', 'appointment_at');

  const endTime = new Date(apptTime.getTime() + validated.duration_minutes * 60000);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Advisory lock per doctor serializes concurrent bookings.
    await connection.execute(
      "SELECT GET_LOCK(CONCAT('appointment_doctor_', ?), 10) AS acquired",
      [validated.doctor_id]
    );

    // Re-check doctor still active inside the lock.
    const [dr] = await connection.execute(
      'SELECT doctor_id FROM doctors WHERE doctor_id = ? AND is_active = 1 FOR UPDATE',
      [validated.doctor_id]
    );
    if (dr.length === 0) {
      await connection.execute('SELECT RELEASE_LOCK(?)', [`appointment_doctor_${validated.doctor_id}`]);
      await connection.rollback();
      throw new ValidationError('Doctor not found or inactive.', 'doctor_id');
    }

    // Duration-aware conflict check inside the transaction.
    const conflict = await appointmentsRepo.checkConflict(
      validated.doctor_id,
      validated.appointment_at,
      endTime.toISOString().slice(0, 19).replace('T', ' ')
    );
    if (conflict) {
      await connection.execute('SELECT RELEASE_LOCK(?)', [`appointment_doctor_${validated.doctor_id}`]);
      await connection.rollback();
      throw new ConflictError('Doctor already has an appointment in the requested time slot.');
    }

    const appointmentId = await appointmentsRepo.createAppointment({
      patient_id: validated.patient_id,
      doctor_id: validated.doctor_id,
      appointment_at: validated.appointment_at,
      duration_minutes: validated.duration_minutes,
      reason: validated.reason,
      notes: validated.notes,
    });

    await connection.execute('SELECT RELEASE_LOCK(?)', [`appointment_doctor_${validated.doctor_id}`]);
    await connection.commit();
    return appointmentId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function updateStatus(appointmentId, status, expectedCurrent) {
  if (!STATUSES.includes(status)) {
    throw new ValidationError('Invalid appointment status.');
  }
  const appointment = await appointmentsRepo.showAppointment(appointmentId);
  if (!appointment) throw new NotFoundError('Appointment not found.');
  if (expectedCurrent && appointment.status !== expectedCurrent) {
    throw new ValidationError(`Cannot transition from ${appointment.status} to ${status}.`);
  }
  if (!ALLOWED_TRANSITIONS[appointment.status] || !ALLOWED_TRANSITIONS[appointment.status].includes(status)) {
    throw new ValidationError(`Cannot transition from ${appointment.status} to ${status}.`);
  }
  await appointmentsRepo.updateStatus(appointmentId, status);
}

module.exports = {
  bookAppointment, updateStatus, showAppointment, validateAppointment, listAppointments,
};