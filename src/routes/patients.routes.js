'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId, validateFilters } = require('../middleware/validate-request');
const patientsController = require('../controllers/patients.controller');

router.get('/', requireAuth, authorize('patients_read'), validateFilters, patientsController.index);
router.get('/new', requireAuth, authorize('patients_write'), patientsController.createForm);
router.post('/', requireAuth, authorize('patients_write'), csrf, patientsController.create);
router.get('/:id', requireAuth, authorize('patients_read'), validateId, patientsController.show);
router.get('/:id/edit', requireAuth, authorize('patients_write'), validateId, patientsController.editForm);
router.post('/:id/update', requireAuth, authorize('patients_write'), csrf, validateId, patientsController.update);

module.exports = router;