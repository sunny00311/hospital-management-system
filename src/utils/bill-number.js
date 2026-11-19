'use strict';

/**
 * src/utils/bill-number.js
 *
 * Deterministic bill-number generation. Format: BILL-YYYYMMDD-XXXX where the
 * numeric suffix is derived from the current bill count for that day.
 */

const { execute } = require('./sql-loader');
const pool = require('../config/db');

async function generateBillNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM bills WHERE bill_number LIKE CONCAT('BILL-', ?, '-%')`,
    [today]
  );
  const count = Number(rows[0].c) + 1;
  return `BILL-${today}-${String(count).padStart(4, '0')}`;
}

module.exports = { generateBillNumber };