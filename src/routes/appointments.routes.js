'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId, validateFilters } = require('../middleware/validate-request');
const appointmentsController = require('../controllers/appointments.controller');

router.get('/', requireAuth, authorize('appointments_read'), validateFilters, appointmentsController.index);
router.get('/new', requireAuth, authorize('appointments_write'), appointmentsController.createForm);
router.post('/', requireAuth, authorize('appointments_write'), csrf, appointmentsController.create);
router.get('/:id', requireAuth, authorize('appointments_read'), validateId, appointmentsController.show);
router.post('/:id/status', requireAuth, authorize('appointments_write'), csrf, validateId, appointmentsController.updateStatus);

module.exports = router;