'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { csrf } = require('../middleware/csrf');
const { validateId, validateFilters } = require('../middleware/validate-request');
const medicinesController = require('../controllers/medicines.controller');

router.get('/', requireAuth, authorize('inventory_read'), validateFilters, medicinesController.index);
router.get('/new', requireAuth, authorize('inventory_write'), medicinesController.createForm);
router.post('/', requireAuth, authorize('inventory_write'), csrf, medicinesController.create);
router.get('/:id/edit', requireAuth, authorize('inventory_write'), validateId, medicinesController.editForm);
router.post('/:id/update', requireAuth, authorize('inventory_write'), csrf, validateId, medicinesController.update);
router.get('/:id/stock-adjustment', requireAuth, authorize('inventory_write'), validateId, medicinesController.adjustStockForm);
router.post('/:id/stock-adjustment', requireAuth, authorize('inventory_write'), csrf, validateId, medicinesController.adjustStock);
router.get('/:id/movements', requireAuth, authorize('inventory_read'), validateId, medicinesController.showMovements);

module.exports = router;