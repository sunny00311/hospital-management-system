'use strict';

/**
 * src/controllers/dashboard.controller.js
 */

const dashboardRepo = require('../repositories/dashboard.repository');
const { todayRange } = require('../utils/date');

async function index(req, res) {
  // Date filters: default to today for "today" metrics, and 30 days for period metrics
  const { from, to } = req.query;
  const today = todayRange();
  const todayStart = today.from;
  const todayEnd = today.to;

  // Period for revenue: default to last 30 days
  const periodStart = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const periodEnd = to || new Date().toISOString().slice(0, 19).replace('T', ' ');

  const [kpis, todayAppointments, statusCounts, doctorWorkload, deptTotals, lowStock, recentPayments] = await Promise.all([
    dashboardRepo.getKpis(todayStart, todayEnd, periodStart, periodEnd),
    dashboardRepo.todayAppointments(todayStart, todayEnd),
    dashboardRepo.appointmentStatusCounts(todayStart, todayEnd),
    dashboardRepo.doctorWorkload(todayStart, todayEnd),
    dashboardRepo.departmentTotals(todayStart, todayEnd),
    dashboardRepo.lowStockAlerts(),
    dashboardRepo.recentPayments(10),
  ]);

  res.render('dashboard/index', {
    title: 'Dashboard',
    kpis,
    todayAppointments,
    statusCounts,
    doctorWorkload,
    deptTotals,
    lowStock,
    recentPayments,
    filters: { from: from || '', to: to || '' },
  });
}

module.exports = { index };