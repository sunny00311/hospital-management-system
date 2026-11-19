'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId } = require('../middleware/validate-request');
const medicalRecordsController = require('../controllers/medical-records.controller');

router.get('/appointments/:appointmentId/medical-record', requireAuth, authorize('clinical_read'), validateId, medicalRecordsController.showForAppointment);
router.get('/appointments/:appointmentId/medical-record/new', requireAuth, authorize('clinical_write'), validateId, medicalRecordsController.createForm);
router.post('/appointments/:appointmentId/medical-record', requireAuth, authorize('clinical_write'), csrf, validateId, medicalRecordsController.create);
router.get('/medical-records/:id', requireAuth, authorize('clinical_read'), validateId, medicalRecordsController.show);
router.get('/medical-records/:id/edit', requireAuth, authorize('clinical_write'), validateId, medicalRecordsController.editForm);
router.post('/medical-records/:id/update', requireAuth, authorize('clinical_write'), csrf, validateId, medicalRecordsController.update);

module.exports = router;