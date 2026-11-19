'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateFilters } = require('../middleware/validate-request');
const departmentsController = require('../controllers/departments.controller');

router.get('/', requireAuth, authorize('departments_read'), validateFilters, departmentsController.index);
router.get('/new', requireAuth, authorize('departments_write'), departmentsController.createForm);
router.post('/', requireAuth, authorize('departments_write'), csrf, departmentsController.create);

module.exports = router;