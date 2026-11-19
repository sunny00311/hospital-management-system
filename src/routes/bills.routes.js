'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId, validateFilters } = require('../middleware/validate-request');
const billsController = require('../controllers/bills.controller');

router.get('/', requireAuth, authorize('billing_read'), validateFilters, billsController.index);
router.get('/new', requireAuth, authorize('billing_write'), billsController.createForm);
router.post('/', requireAuth, authorize('billing_write'), csrf, billsController.create);
router.get('/:id', requireAuth, authorize('billing_read'), validateId, billsController.show);
router.get('/:id/edit', requireAuth, authorize('billing_write'), validateId, billsController.editForm);
router.post('/:id/update', requireAuth, authorize('billing_write'), csrf, validateId, billsController.update);
router.post('/:id/cancel', requireAuth, authorize('billing_write'), csrf, validateId, billsController.cancel);

module.exports = router;