'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId, validateFilters } = require('../middleware/validate-request');
const paymentsController = require('../controllers/payments.controller');

router.get('/', requireAuth, authorize('billing_read'), validateFilters, paymentsController.index);
router.get('/:id', requireAuth, authorize('billing_read'), validateId, paymentsController.show);
router.get('/new', requireAuth, authorize('payment_write'), paymentsController.createForm);
router.post('/', requireAuth, authorize('payment_write'), csrf, paymentsController.create);

module.exports = router;