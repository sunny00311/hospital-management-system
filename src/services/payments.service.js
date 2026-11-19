'use strict';

/**
 * src/services/payments.service.js
 *
 * Payment recording with transaction-safe overpayment prevention.
 * Uses SELECT ... FOR UPDATE on the bill row, calculates current balance
 * inside the transaction, inserts payment, and updates bill status.
 */

const pool = require('../config/db');
const billsRepo = require('../repositories/bills.repository');
const paymentsRepo = require('../repositories/payments.repository');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const {
  requireInt, requireDecimal, requireStr, requireEnum, optionalStr,
} = require('../utils/validators');
const { generatePaymentNumber } = require('../utils/payment-number');

const PAYMENT_METHODS = ['Cash', 'Card', 'Insurance', 'UPI', 'Bank Transfer'];

function validatePayment(data) {
  const bill_id = requireInt(data.bill_id, 'bill_id');
  const amount = requireDecimal(data.amount, 'amount');
  const payment_method = requireEnum(data.payment_method, PAYMENT_METHODS, 'payment_method');
  const reference = optionalStr(data.reference, 'reference', 80);
  if (amount <= 0) throw new ValidationError('Payment amount must be greater than zero.', 'amount');
  return { bill_id, amount, payment_method, reference };
}

async function listPayments(from, to, paymentMethod, patientId, page, limit) {
  const offset = (page - 1) * limit;
  const [rows, count] = await Promise.all([
    paymentsRepo.listPayments(from, to, paymentMethod, patientId, limit, offset),
    paymentsRepo.countPayments(from, to, paymentMethod, patientId),
  ]);
  return { rows, count, page, limit };
}

async function showPayment(paymentId) {
  const payment = await paymentsRepo.showPayment(paymentId);
  if (!payment) throw new NotFoundError('Payment not found.');
  return payment;
}

async function recordPayment(data, paidBy) {
  const validated = validatePayment(data);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Lock the bill row to prevent concurrent payment processing.
    const bill = await billsRepo.lockBillForPayment(validated.bill_id);
    if (!bill) throw new NotFoundError('Bill not found.');

    if (bill.status === 'Cancelled') {
      throw new ValidationError('Cannot record payment against a cancelled bill.');
    }

    const outstanding = Number(bill.outstanding_amount);
    if (validated.amount > outstanding) {
      throw new ConflictError(`Payment exceeds the outstanding balance of ${outstanding.toFixed(2)}.`);
    }

    // Generate payment number inside transaction (no gap risk since sequence is per-day).
    const paymentNumber = await generatePaymentNumber();

    // Insert payment.
    await paymentsRepo.createPayment({
      payment_number: paymentNumber,
      bill_id: validated.bill_id,
      amount: validated.amount,
      payment_method: validated.payment_method,
      reference: validated.reference,
      paid_by: paidBy,
    });

    // The trigger trg_payments_after_insert will recompute bill totals.
    // We could also manually update here, but the trigger handles it.
    await connection.commit();

    return paymentNumber;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  listPayments, showPayment, recordPayment, validatePayment,
};