'use strict';

/**
 * src/services/departments.service.js
 */

const {
  ValidationError, requireStr, optionalStr,
} = require('../utils/validators');
const departmentsRepo = require('../repositories/departments.repository');

function validateDepartment(data) {
  const errors = {};
  const department_name = requireStr(data.department_name, 'department_name', 120);
  const description = optionalStr(data.description, 'description', 500);
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Please correct the highlighted fields.');
  }
  return { department_name, description };
}

async function listDepartments(page, limit) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    departmentsRepo.listDepartments(limit, offset),
    departmentsRepo.countDepartments(),
  ]);
  return { rows, count, page, limit };
}

async function createDepartment(data) {
  const validated = validateDepartment(data);
  return departmentsRepo.createDepartment(validated);
}

module.exports = { listDepartments, createDepartment, validateDepartment };