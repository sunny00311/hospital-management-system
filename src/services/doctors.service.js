'use strict';

/**
 * src/services/doctors.service.js
 */

const {
  ValidationError, requireStr, requireDecimal, optionalStr, optionalPhone,
  optionalEmail, requireInt,
} = require('../utils/validators');
const { ConflictError, NotFoundError } = require('../utils/errors');
const doctorsRepo = require('../repositories/doctors.repository');

const STATUSES = ['active', 'inactive'];

function validateDoctor(data) {
  const errors = {};
  const department_id = requireInt(data.department_id, 'department_id');
  const full_name = requireStr(data.full_name, 'full_name', 120);
  const specialization = requireStr(data.specialization, 'specialization', 150);
  const phone = optionalPhone(data.phone, 'phone');
  const email = optionalEmail(data.email, 'email');
  const consultation_fee = requireDecimal(data.consultation_fee, 'consultation_fee');
  const is_active = data.is_active === undefined ? 1 : (data.is_active === true || data.is_active === 'true' || data.is_active === 1 || data.is_active === '1' ? 1 : 0);

  if (department_id <= 0) errors.department_id = 'Department is required.';
  if (consultation_fee < 0) errors.consultation_fee = 'Consultation fee cannot be negative.';
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.');
  }
  return {
    department_id, full_name, specialization, phone, email,
    consultation_fee, is_active,
  };
}

async function listDoctors(q, departmentId, status, page, limit) {
  if (status && !STATUSES.includes(status)) {
    throw new ValidationError('Invalid status filter.');
  }
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    doctorsRepo.listDoctors(q, departmentId, status, limit, offset),
    doctorsRepo.countDoctors(q, departmentId, status),
  ]);
  return { rows, count, page, limit };
}

async function showDoctor(doctorId) {
  const doctor = await doctorsRepo.showDoctor(doctorId);
  if (!doctor) throw new NotFoundError('Doctor not found.');
  return doctor;
}

async function createDoctor(data) {
  const validated = validateDoctor(data);
  // Validate department exists.
  const deptRows = await require('../config/db').execute(
    'SELECT department_id FROM departments WHERE department_id = ? AND is_active = 1',
    [validated.department_id]
  );
  if (deptRows[0].length === 0) {
    throw new ValidationError('Selected department does not exist or is inactive.');
  }
  return doctorsRepo.createDoctor(validated);
}

async function updateDoctor(doctorId, data) {
  const validated = validateDoctor(data);
  const deptRows = await require('../config/db').execute(
    'SELECT department_id FROM departments WHERE department_id = ? AND is_active = 1',
    [validated.department_id]
  );
  if (deptRows[0].length === 0) {
    throw new ValidationError('Selected department does not exist or is inactive.');
  }
  await doctorsRepo.updateDoctor(doctorId, validated);
}

async function updateDoctorStatus(doctorId, isActive) {
  if (isActive !== 0 && isActive !== 1) {
    throw new ValidationError('Invalid status value.');
  }
  await doctorsRepo.updateDoctorStatus(doctorId, isActive);
}

module.exports = {
  listDoctors, showDoctor, createDoctor, updateDoctor, updateDoctorStatus,
  validateDoctor,
};