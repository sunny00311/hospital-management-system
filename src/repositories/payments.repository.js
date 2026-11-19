'use strict';

/**
 * src/repositories/payments.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listPayments(from, to, paymentMethod, patientId, limit, offset) {
  const [rows] = await execute(pool, 'billing/005_list_payments.sql', [
    from, from, to, to, paymentMethod, paymentMethod, patientId, patientId, limit, offset,
  ]);
  return rows;
}

async function showPayment(paymentId) {
  const [rows] = await execute(pool, 'billing/006_show_payment.sql', [paymentId]);
  return rows[0] || null;
}

async function createPayment(data) {
  const [result] = await execute(pool, 'billing/009_create_payment.sql', [
    data.payment_number, data.bill_id, data.amount,
    data.payment_method, data.reference, data.paid_by,
  ]);
  return result.insertId;
}

async function countPayments(from, to, paymentMethod, patientId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM payments py
     JOIN bills b ON b.bill_id = py.bill_id
     WHERE (? IS NULL OR py.paid_at >= ?)
       AND (? IS NULL OR py.paid_at < ?)
       AND (? IS NULL OR py.payment_method = ?)
       AND (? IS NULL OR b.patient_id = ?)`,
    [from, from, to, to, paymentMethod, paymentMethod, patientId, patientId]
  );
  return Number(rows[0].c);
}

module.exports = { listPayments, showPayment, createPayment, countPayments };