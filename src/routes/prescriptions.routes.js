'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId } = require('../middleware/validate-request');
const prescriptionsController = require('../controllers/prescriptions.controller');

router.get('/medical-records/:recordId/prescriptions/new', requireAuth, authorize('prescription_write'), validateId, prescriptionsController.createForm);
router.post('/medical-records/:recordId/prescriptions', requireAuth, authorize('prescription_write'), csrf, validateId, prescriptionsController.create);
router.get('/prescriptions/:id', requireAuth, authorize('clinical_read'), validateId, prescriptionsController.show);
router.post('/prescriptions/:id/dispense', requireAuth, authorize('prescription_write'), csrf, validateId, prescriptionsController.dispense);

module.exports = router;