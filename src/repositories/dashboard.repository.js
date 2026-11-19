'use strict';

/**
 * src/repositories/dashboard.repository.js
 *
 * Dashboard KPI and panel queries.
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function getKpis(todayStart, todayEnd, periodStart, periodEnd) {
  const [rows] = await execute(pool, 'reports/001_dashboard_kpis.sql', [
    todayStart, todayEnd, todayStart, todayEnd, todayStart, todayEnd, periodStart, periodEnd,
  ]);
  return rows[0];
}

async function todayAppointments(todayStart, todayEnd) {
  const [rows] = await execute(pool, 'appointments/005_today_appointments.sql', [todayStart, todayEnd]);
  return rows;
}

async function appointmentStatusCounts(todayStart, todayEnd) {
  const [rows] = await execute(pool, 'appointments/004_appointment_status_counts.sql', [todayStart, todayEnd]);
  return rows;
}

async function doctorWorkload(todayStart, todayEnd) {
  const [rows] = await pool.execute(
    `SELECT d.doctor_id, d.full_name AS doctor_name, dept.department_name,
            COUNT(a.appointment_id) AS total_appointments,
            SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) AS completed_count,
            SUM(CASE WHEN a.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_count,
            SUM(CASE WHEN a.status = 'No-show' THEN 1 ELSE 0 END) AS no_show_count
     FROM doctors d
     JOIN departments dept ON dept.department_id = d.department_id
     LEFT JOIN appointments a ON a.doctor_id = d.doctor_id
       AND a.appointment_at >= ? AND a.appointment_at < ?
     GROUP BY d.doctor_id, d.full_name, dept.department_name
     ORDER BY total_appointments DESC, d.full_name`,
    [todayStart, todayEnd]
  );
  return rows;
}

async function departmentTotals(todayStart, todayEnd) {
  const [rows] = await execute(pool, 'appointments/006_department_totals.sql', [todayStart, todayEnd]);
  return rows;
}

async function lowStockAlerts() {
  const [rows] = await pool.execute(
    `SELECT medicine_id, medicine_name, stock_quantity, reorder_level, unit
     FROM medicines
     WHERE stock_quantity <= reorder_level AND is_active = 1
     ORDER BY stock_quantity ASC, medicine_name ASC
     LIMIT 10`
  );
  return rows;
}

async function recentPayments(limit = 10) {
  const [rows] = await pool.execute(
    `SELECT py.payment_id, py.payment_number, py.amount, py.payment_method,
            py.paid_at, p.full_name AS patient_name, b.bill_number
     FROM payments py
     JOIN bills b ON b.bill_id = py.bill_id
     JOIN patients p ON p.patient_id = b.patient_id
     ORDER BY py.paid_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
}

module.exports = {
  getKpis, todayAppointments, appointmentStatusCounts, doctorWorkload,
  departmentTotals, lowStockAlerts, recentPayments,
};