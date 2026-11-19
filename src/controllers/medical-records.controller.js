'use strict';

/**
 * src/controllers/medical-records.controller.js
 */

const medicalRecordsService = require('../services/medical-records.service');
const appointmentsRepo = require('../repositories/appointments.repository');
const { setFlash } = require('../middleware/flash');
const { ValidationError, ConflictError, NotFoundError } = require('../utils/errors');
const { validateId } = require('../middleware/validate-request');

async function showForAppointment(req, res) {
  const record = await medicalRecordsService.showForAppointment(req.validatedId);
  res.render('medical-records/show', { title: 'Medical Record', record });
}

async function createForm(req, res) {
  const appointment = await appointmentsRepo.showAppointment(req.validatedId);
  if (!appointment) {
    return res.status(404).render('errors/404', { title: 'Not found', message: 'Appointment not found.' });
  }
  if (appointment.status !== 'Completed') {
    setFlash(req, 'error', 'Medical records can only be created for completed appointments.');
    return res.redirect(`/appointments/${req.validatedId}`);
  }
  const existing = await medicalRecordsService.showForAppointment(req.validatedId).catch(() => null);
  if (existing) {
    setFlash(req, 'error', 'A medical record already exists for this appointment.');
    return res.redirect(`/appointments/${req.validatedId}`);
  }
  res.render('medical-records/form', { title: 'Create Medical Record', record: null, appointment, errors: null });
}

async function create(req, res) {
  try {
    await medicalRecordsService.createMedicalRecord(req.validatedId, req.body, req.session.user.user_id);
    setFlash(req, 'success', 'Medical record created successfully.');
    res.redirect(`/appointments/${req.validatedId}/medical-record`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const appointment = await appointmentsRepo.showAppointment(req.validatedId);
      return res.status(400).render('medical-records/form', {
        title: 'Create Medical Record',
        record: req.body,
        appointment,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    if (err instanceof ConflictError) {
      const appointment = await appointmentsRepo.showAppointment(req.validatedId);
      return res.status(409).render('medical-records/form', {
        title: 'Create Medical Record',
        record: req.body,
        appointment,
        errors: { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/appointments/${req.validatedId}/medical-record/new`);
  }
}

async function show(req, res) {
  const record = await medicalRecordsService.showRecord(req.validatedId);
  res.render('medical-records/show', { title: 'Medical Record', record });
}

async function editForm(req, res) {
  const record = await medicalRecordsService.showRecord(req.validatedId);
  res.render('medical-records/form', { title: 'Edit Medical Record', record, appointment: null, errors: null });
}

async function update(req, res) {
  try {
    await medicalRecordsService.updateMedicalRecord(req.validatedId, req.body);
    setFlash(req, 'success', 'Medical record updated successfully.');
    res.redirect(`/medical-records/${req.validatedId}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const record = await medicalRecordsService.showRecord(req.validatedId);
      return res.status(400).render('medical-records/form', {
        title: 'Edit Medical Record',
        record: { ...record, ...req.body },
        appointment: null,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/medical-records/${req.validatedId}/edit`);
  }
}

module.exports = { showForAppointment, createForm, create, show, editForm, update };