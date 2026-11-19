'use strict';

/**
 * src/controllers/patients.controller.js
 */

const patientsService = require('../services/patients.service');
const { setFlash } = require('../middleware/flash');
const { ValidationError } = require('../utils/validators');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function index(req, res) {
  const { q, from, to, page, limit } = parsePagination(req.query);
  const { rows, count } = await patientsService.listPatients(q, from, to, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('patients/index', {
    title: 'Patients',
    patients: rows,
    meta,
    filters: { q: q || '', from: from || '', to: to || '' },
  });
}

async function createForm(req, res) {
  res.render('patients/form', { title: 'Register Patient', patient: null, errors: null });
}

async function create(req, res) {
  try {
    const id = await patientsService.createPatient(req.body);
    setFlash(req, 'success', 'Patient registered successfully.');
    res.redirect(`/patients/${id}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).render('patients/form', {
        title: 'Register Patient',
        patient: req.body,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect('/patients/new');
  }
}

async function show(req, res) {
  const patient = await patientsService.showPatient(req.validatedId);
  res.render('patients/show', { title: patient.full_name, patient });
}

async function editForm(req, res) {
  const patient = await patientsService.showPatient(req.validatedId);
  res.render('patients/form', { title: 'Edit Patient', patient, errors: null });
}

async function update(req, res) {
  try {
    await patientsService.updatePatient(req.validatedId, req.body);
    setFlash(req, 'success', 'Patient updated successfully.');
    res.redirect(`/patients/${req.validatedId}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const patient = await patientsService.showPatient(req.validatedId);
      return res.status(400).render('patients/form', {
        title: 'Edit Patient',
        patient: { ...patient, ...req.body },
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/patients/${req.validatedId}/edit`);
  }
}

module.exports = { index, createForm, create, show, editForm, update };