'use strict';

/**
 * src/controllers/bills.controller.js
 */

const billsService = require('../services/bills.service');
const patientsRepo = require('../repositories/patients.repository');
const appointmentsRepo = require('../repositories/appointments.repository');
const medicinesRepo = require('../repositories/medicines.repository');
const { setFlash } = require('../middleware/flash');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { validateId } = require('../middleware/validate-request');

async function index(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { q, from, to, status } = req.query;
  const { rows, count } = await billsService.listBills(q, from, to, status, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('billing/index', {
    title: 'Billing',
    bills: rows,
    meta,
    filters: { q: q || '', from: from || '', to: to || '', status: status || '' },
  });
}

async function createForm(req, res) {
  const [patients, doctors, medicines] = await Promise.all([
    patientsRepo.listPatients(null, null, null, 1000, 0),
    require('../repositories/doctors.repository').listDoctors(null, null, 'active', 1000, 0),
    medicinesRepo.listMedicines(null, null, 1000, 0),
  ]);
  res.render('bills/form', {
    title: 'Generate Bill',
    bill: null,
    patients,
    doctors,
    medicines,
    errors: null,
  });
}

async function create(req, res) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await billsService.createBill({
      patient_id: req.body.patient_id,
      appointment_id: req.body.appointment_id || null,
      bill_date: req.body.bill_date,
      due_date: req.body.due_date || null,
      created_by: req.session.user.user_id,
    }, items);
    setFlash(req, 'success', 'Bill generated successfully.');
    res.redirect('/billing');
  } catch (err) {
    if (err instanceof ValidationError) {
      const [patients, doctors, medicines] = await Promise.all([
        patientsRepo.listPatients(null, null, null, 1000, 0),
        require('../repositories/doctors.repository').listDoctors(null, null, 'active', 1000, 0),
        medicinesRepo.listMedicines(null, null, 1000, 0),
      ]);
      return res.status(400).render('bills/form', {
        title: 'Generate Bill',
        bill: req.body,
        patients,
        doctors,
        medicines,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect('/bills/new');
  }
}

async function show(req, res) {
  const bill = await billsService.showBill(req.validatedId);
  res.render('bills/show', { title: `Bill ${bill.bill_number}`, bill });
}

async function editForm(req, res) {
  const bill = await billsService.showBill(req.validatedId);
  if (bill.status !== 'Draft' && bill.status !== 'Pending') {
    setFlash(req, 'error', 'Cannot edit a bill that has received payments or been finalized.');
    return res.redirect(`/bills/${req.validatedId}`);
  }
  const [patients, doctors, medicines] = await Promise.all([
    patientsRepo.listPatients(null, null, null, 1000, 0),
    require('../repositories/doctors.repository').listDoctors(null, null, 'active', 1000, 0),
    medicinesRepo.listMedicines(null, null, 1000, 0),
  ]);
  res.render('bills/form', {
    title: 'Edit Bill',
    bill,
    patients,
    doctors,
    medicines,
    errors: null,
  });
}

async function update(req, res) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await billsService.updateBill(req.validatedId, req.body, items);
    setFlash(req, 'success', 'Bill updated successfully.');
    res.redirect(`/bills/${req.validatedId}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const bill = await billsService.showBill(req.validatedId);
      const [patients, doctors, medicines] = await Promise.all([
        patientsRepo.listPatients(null, null, null, 1000, 0),
        require('../repositories/doctors.repository').listDoctors(null, null, 'active', 1000, 0),
        medicinesRepo.listMedicines(null, null, 1000, 0),
      ]);
      return res.status(400).render('bills/form', {
        title: 'Edit Bill',
        bill: { ...bill, ...req.body },
        patients,
        doctors,
        medicines,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/bills/${req.validatedId}/edit`);
  }
}

async function cancel(req, res) {
  try {
    await billsService.cancelBill(req.validatedId);
    setFlash(req, 'success', 'Bill cancelled successfully.');
    res.redirect('/billing');
  } catch (err) {
    setFlash(req, 'error', err.message);
    res.redirect(`/bills/${req.validatedId}`);
  }
}

module.exports = { index, createForm, create, show, editForm, update, cancel };