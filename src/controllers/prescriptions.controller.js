'use strict';

/**
 * src/controllers/prescriptions.controller.js
 */

const prescriptionsService = require('../services/prescriptions.service');
const medicalRecordsRepo = require('../repositories/medical-records.repository');
const medicinesRepo = require('../repositories/medicines.repository');
const { setFlash } = require('../middleware/flash');
const { ValidationError, ConflictError, NotFoundError } = require('../utils/errors');
const { validateId } = require('../middleware/validate-request');

async function createForm(req, res) {
  const record = await medicalRecordsRepo.showRecord(req.validatedId);
  if (!record) {
    return res.status(404).render('errors/404', { title: 'Not found', message: 'Medical record not found.' });
  }
  const medicines = await medicinesRepo.listMedicines(null, null, 1000, 0);
  res.render('prescriptions/form', {
    title: 'Create Prescription',
    prescription: null,
    record,
    medicines,
    errors: null,
  });
}

async function create(req, res) {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await prescriptionsService.createPrescription(
      { record_id: req.validatedId, doctor_id: req.body.doctor_id, patient_id: req.body.patient_id, notes: req.body.notes },
      items
    );
    setFlash(req, 'success', 'Prescription created successfully.');
    res.redirect(`/medical-records/${req.validatedId}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const record = await medicalRecordsRepo.showRecord(req.validatedId);
      const medicines = await medicinesRepo.listMedicines(null, null, 1000, 0);
      return res.status(400).render('prescriptions/form', {
        title: 'Create Prescription',
        prescription: req.body,
        record,
        medicines,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    if (err instanceof ConflictError) {
      const record = await medicalRecordsRepo.showRecord(req.validatedId);
      const medicines = await medicinesRepo.listMedicines(null, null, 1000, 0);
      return res.status(409).render('prescriptions/form', {
        title: 'Create Prescription',
        prescription: req.body,
        record,
        medicines,
        errors: { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/medical-records/${req.validatedId}/prescriptions/new`);
  }
}

async function show(req, res) {
  const prescription = await prescriptionsService.showPrescription(req.validatedId);
  res.render('prescriptions/show', { title: 'Prescription', prescription });
}

async function dispense(req, res) {
  try {
    await prescriptionsService.dispensePrescription(req.validatedId, req.session.user.user_id);
    setFlash(req, 'success', 'Prescription dispensed and stock updated.');
    res.redirect(`/prescriptions/${req.validatedId}`);
  } catch (err) {
    setFlash(req, 'error', err.message);
    res.redirect(`/prescriptions/${req.validatedId}`);
  }
}

module.exports = { createForm, create, show, dispense };