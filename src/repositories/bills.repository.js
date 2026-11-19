'use strict';

/**
 * src/repositories/bills.repository.js
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function listBills(q, from, to, status, limit, offset) {
  const [rows] = await execute(pool, 'billing/001_list_bills.sql', [
    q, q, q, from, from, to, to, status, status, limit, offset,
  ]);
  return rows;
}

async function showBill(billId) {
  const [rows] = await execute(pool, 'billing/002_show_bill.sql', [billId]);
  return rows[0] || null;
}

async function billItems(billId) {
  const [rows] = await execute(pool, 'billing/003_bill_items.sql', [billId]);
  return rows;
}

async function billPayments(billId) {
  const [rows] = await execute(pool, 'billing/004_bill_payments.sql', [billId]);
  return rows;
}

async function createBill(data) {
  const [result] = await execute(pool, 'billing/012_create_bill.sql', [
    data.bill_number, data.patient_id, data.appointment_id, data.status,
    data.total_amount, data.paid_amount, data.outstanding_amount,
    data.bill_date, data.due_date, data.created_by,
  ]);
  return result.insertId;
}

async function updateBill(billId, data) {
  await execute(pool, 'billing/013_update_bill.sql', [
    data.patient_id, data.appointment_id, data.bill_date, data.due_date, billId,
  ]);
}

async function recomputeTotals(billId) {
  await execute(pool, 'billing/008_recompute_bill_totals.sql', [billId, billId]);
}

async function createBillItems(billId, items) {
  for (const item of items) {
    await execute(pool, 'billing/007_create_bill_items.sql', [
      billId, item.description, item.quantity, item.unit_price, item.medicine_id || null,
    ]);
  }
}

async function deleteBillItems(billId) {
  await execute(pool, 'billing/014_delete_bill_items.sql', [billId]);
}

async function cancelBill(billId) {
  await execute(pool, 'billing/015_delete_bill.sql', [billId]);
}

async function countBills(q, from, to, status) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM bills b
     JOIN patients p ON p.patient_id = b.patient_id
     WHERE (? IS NULL
            OR p.full_name LIKE CONCAT('%', ?, '%')
            OR b.bill_number LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR b.bill_date >= ?)
       AND (? IS NULL OR b.bill_date < ?)
       AND (? IS NULL OR b.status = ?)`,
    [q, q, q, from, from, to, to, status, status]
  );
  return Number(rows[0].c);
}

async function lockBillForPayment(billId) {
  const [rows] = await execute(pool, 'billing/011_lock_bill_for_payment.sql', [billId]);
  return rows[0] || null;
}

async function updateBillStatus(billId, status) {
  await execute(pool, 'billing/010_update_bill_status.sql', [status, billId]);
}

module.exports = {
  listBills, showBill, billItems, billPayments, createBill, updateBill,
  recomputeTotals, createBillItems, deleteBillItems, cancelBill,
  countBills, lockBillForPayment, updateBillStatus,
};