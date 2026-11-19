'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const dashboardController = require('../controllers/dashboard.controller');

router.get('/', requireAuth, authorize('dashboard'), dashboardController.index);
router.get('/dashboard', requireAuth, authorize('dashboard'), dashboardController.index);

module.exports = router;