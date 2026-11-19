'use strict';

/**
 * src/services/patients.service.js
 *
 * Business rules for patient management. Coordinates repositories and enforces
 * validation/constraint rules. No Express objects here.
 */

const {
  ValidationError,
  requireStr, requireEnum, requireDate, requirePhone, optionalPhone,
  optionalEmail, optionalStr,
} = require('../utils/validators');
const patientsRepo = require('../repositories/patients.repository');

const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'];

function validatePatient(data, isUpdate = false) {
  const errors = {};
  const full_name = requireStr(data.full_name, 'full_name', 120);
  const gender = requireEnum((data.gender || '').trim(), GENDERS, 'gender');
  const date_of_birth = requireDate(data.date_of_birth, 'date_of_birth');
  const phone = optionalPhone(data.phone, 'phone');
  const email = optionalEmail(data.email, 'email');
  const address = optionalStr(data.address, 'address', 300);
  const blood_group = requireEnum(
    (data.blood_group || 'Unknown').trim(), BLOOD_GROUPS, 'blood_group'
  );

  // Date of birth must not be in the future.
  if (date_of_birth > new Date().toISOString().slice(0, 10)) {
    errors.date_of_birth = 'Date of birth cannot be in the future.';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.');
  }
  return {
    full_name, gender, date_of_birth, phone, email, address, blood_group,
  };
}

async function listPatients(q, from, to, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    patientsRepo.listPatients(q, from, to, limit, offset),
    patientsRepo.countPatients(q, from, to),
  ]);
  return { rows, count, page, limit };
}

async function showPatient(patientId) {
  const patient = await patientsRepo.showPatient(patientId);
  if (!patient) {
    const { NotFoundError } = require('../utils/errors');
    throw new NotFoundError('Patient not found.');
  }
  return patient;
}

async function createPatient(data) {
  const validated = validatePatient(data);
  const id = await patientsRepo.createPatient(validated);
  return id;
}

async function updatePatient(patientId, data) {
  const validated = validatePatient(data, true);
  await patientsRepo.updatePatient(patientId, validated);
}

module.exports = {
  listPatients, showPatient, createPatient, updatePatient, validatePatient,
};