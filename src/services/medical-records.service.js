'use strict';

/**
 * src/services/medical-records.service.js
 */

const {
  ValidationError, requireStr, optionalStr,
} = require('../utils/validators');
const { NotFoundError, ConflictError } = require('../utils/errors');
const recordsRepo = require('../repositories/medical-records.repository');
const appointmentsRepo = require('../repositories/appointments.repository');

function validateMedicalRecord(data) {
  const errors = {};
  const diagnosis = requireStr(data.diagnosis, 'diagnosis', 65535);
  const treatment = optionalStr(data.treatment, 'treatment', 65535);
  const notes = optionalStr(data.notes, 'notes', 65535);
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.');
  }
  return { diagnosis, treatment, notes };
}

async function showForAppointment(appointmentId) {
  const record = await recordsRepo.showForAppointment(appointmentId);
  if (!record) throw new NotFoundError('Medical record not found for this appointment.');
  return record;
}

async function showRecord(recordId) {
  const record = await recordsRepo.showRecord(recordId);
  if (!record) throw new NotFoundError('Medical record not found.');
  return record;
}

async function createMedicalRecord(appointmentId, data, recordedBy) {
  const validated = validateMedicalRecord(data);

  const appointment = await appointmentsRepo.showAppointment(appointmentId);
  if (!appointment) throw new NotFoundError('Appointment not found.');

  if (appointment.status !== 'Completed') {
    throw new ValidationError('Medical records can only be created for completed appointments.');
  }

  const exists = await recordsRepo.recordExistsForAppointment(appointmentId);
  if (exists) throw new ConflictError('A medical record already exists for this appointment.');

  return recordsRepo.createMedicalRecord({
    appointment_id: appointmentId,
    diagnosis: validated.diagnosis,
    treatment: validated.treatment,
    notes: validated.notes,
    recorded_by: recordedBy,
  });
}

async function updateMedicalRecord(recordId, data) {
  const record = await recordsRepo.showRecord(recordId);
  if (!record) throw new NotFoundError('Medical record not found.');
  const validated = validateMedicalRecord(data);
  await recordsRepo.updateMedicalRecord(recordId, validated);
}

module.exports = {
  showForAppointment, showRecord, createMedicalRecord, updateMedicalRecord,
  validateMedicalRecord,
};