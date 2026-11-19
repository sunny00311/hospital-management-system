'use strict';

/**
 * src/utils/payment-number.js
 *
 * Deterministic payment-number generation. Format: PAY-YYYYMMDD-XXXX.
 */

const pool = require('../config/db');

async function generatePaymentNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM payments WHERE payment_number LIKE CONCAT('PAY-', ?, '-%')`,
    [today]
  );
  const count = Number(rows[0].c) + 1;
  return `PAY-${today}-${String(count).padStart(4, '0')}`;
}

module.exports = { generatePaymentNumber };