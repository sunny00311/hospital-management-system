'use strict';

/**
 * src/controllers/payments.controller.js
 */

const paymentsService = require('../services/payments.service');
const billsRepo = require('../repositories/bills.repository');
const { setFlash } = require('../middleware/flash');
const { ValidationError, ConflictError, NotFoundError } = require('../utils/errors');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { validateId } = require('../middleware/validate-request');

async function index(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, payment_method, patient_id } = req.query;
  const { rows, count } = await paymentsService.listPayments(from, to, payment_method, patient_id, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('payments/index', {
    title: 'Payments',
    payments: rows,
    meta,
    filters: { from: from || '', to: to || '', payment_method: payment_method || '', patient_id: patient_id || '' },
  });
}

async function show(req, res) {
  const payment = await paymentsService.showPayment(req.validatedId);
  res.render('payments/show', { title: `Payment ${payment.payment_number}`, payment });
}

async function createForm(req, res) {
  // Show payment form for a specific bill
  const billId = req.query.bill_id;
  if (!billId) {
    setFlash(req, 'error', 'Bill ID is required.');
    return res.redirect('/payments');
  }
  const bill = await billsRepo.showBill(billId);
  if (!bill) {
    return res.status(404).render('errors/404', { title: 'Not found', message: 'Bill not found.' });
  }
  res.render('payments/form', { title: 'Record Payment', payment: { bill_id: billId }, bill, errors: null });
}

async function create(req, res) {
  try {
    await paymentsService.recordPayment(req.body, req.session.user.user_id);
    setFlash(req, 'success', 'Payment recorded successfully.');
    res.redirect(`/bills/${req.body.bill_id}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const bill = await billsRepo.showBill(req.body.bill_id);
      return res.status(400).render('payments/form', {
        title: 'Record Payment',
        payment: req.body,
        bill,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    if (err instanceof ConflictError) {
      const bill = await billsRepo.showBill(req.body.bill_id);
      return res.status(409).render('payments/form', {
        title: 'Record Payment',
        payment: req.body,
        bill,
        errors: { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/payments/new?bill_id=${req.body.bill_id}`);
  }
}

module.exports = { index, show, createForm, create };