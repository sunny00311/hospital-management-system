'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');
const { validateFilters } = require('../middleware/validate-request');
const reportsController = require('../controllers/reports.controller');

router.get('/', requireAuth, authorize('dashboard'), reportsController.index);
router.get('/patients', requireAuth, authorize('patients_read'), validateFilters, reportsController.patients);
router.get('/appointments', requireAuth, authorize('appointments_read'), validateFilters, reportsController.appointments);
router.get('/doctors', requireAuth, authorize('doctors_read'), validateFilters, reportsController.doctors);
router.get('/departments', requireAuth, authorize('departments_read'), validateFilters, reportsController.departments);
router.get('/revenue', requireAuth, authorize('financial_reports'), validateFilters, reportsController.revenue);
router.get('/outstanding-bills', requireAuth, authorize('financial_reports'), validateFilters, reportsController.outstandingBills);
router.get('/payments', requireAuth, authorize('financial_reports'), validateFilters, reportsController.payments);
router.get('/medicine-stock', requireAuth, authorize('inventory_read'), validateFilters, reportsController.medicineStock);
router.get('/prescriptions', requireAuth, authorize('clinical_reports'), validateFilters, reportsController.prescriptions);
router.get('/:reportKey/export.csv', requireAuth, authorize('report_export'), reportsController.exportCsv);

module.exports = router;