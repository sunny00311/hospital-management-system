'use strict';

/**
 * src/repositories/departments.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listDepartments(limit, offset) {
  const [rows] = await execute(pool, 'billing/031_list_departments.sql', [limit, offset]);
  return rows;
}

async function createDepartment(data) {
  const [result] = await execute(pool, 'billing/032_create_department.sql', [
    data.department_name, data.description,
  ]);
  return result.insertId;
}

async function countDepartments() {
  const [rows] = await pool.execute('SELECT COUNT(*) AS c FROM departments');
  return Number(rows[0].c);
}

module.exports = { listDepartments, createDepartment, countDepartments };