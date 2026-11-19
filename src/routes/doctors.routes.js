'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId, validateFilters } = require('../middleware/validate-request');
const doctorsController = require('../controllers/doctors.controller');

router.get('/', requireAuth, authorize('doctors_read'), validateFilters, doctorsController.index);
router.get('/new', requireAuth, authorize('doctors_write'), doctorsController.createForm);
router.post('/', requireAuth, authorize('doctors_write'), csrf, doctorsController.create);
router.get('/:id', requireAuth, authorize('doctors_read'), validateId, doctorsController.show);
router.get('/:id/edit', requireAuth, authorize('doctors_write'), validateId, doctorsController.editForm);
router.post('/:id/update', requireAuth, authorize('doctors_write'), csrf, validateId, doctorsController.update);
router.post('/:id/status', requireAuth, authorize('doctors_write'), csrf, validateId, doctorsController.updateStatus);

module.exports = router;