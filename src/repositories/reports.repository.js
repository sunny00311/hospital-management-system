'use strict';

/**
 * src/repositories/reports.repository.js
 *
 * Report queries loaded from database/queries/reports/.
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function reportPatients(q, from, to, limit, offset) {
  const [rows] = await execute(pool, 'reports/002_report_patients.sql', [
    q, q, q, q, from, from, to, to, limit, offset,
  ]);
  return rows;
}

async function countReportPatients(q, from, to) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM patients
     WHERE (? IS NULL
            OR full_name LIKE CONCAT('%', ?, '%')
            OR phone LIKE CONCAT('%', ?, '%')
            OR email LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR created_at >= ?)
       AND (? IS NULL OR created_at < ?)`,
    [q, q, q, q, from, from, to, to]
  );
  return Number(rows[0].c);
}

async function reportAppointments(from, to, patientId, doctorId, departmentId, status, limit, offset) {
  const [rows] = await execute(pool, 'reports/003_report_appointments.sql', [
    from, from, to, to, patientId, patientId, doctorId, doctorId,
    departmentId, departmentId, status, status, limit, offset,
  ]);
  return rows;
}

async function countReportAppointments(from, to, patientId, doctorId, departmentId, status) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM appointments a
     JOIN doctors d ON d.doctor_id = a.doctor_id
     WHERE (? IS NULL OR a.appointment_at >= ?)
       AND (? IS NULL OR a.appointment_at < ?)
       AND (? IS NULL OR a.patient_id = ?)
       AND (? IS NULL OR a.doctor_id = ?)
       AND (? IS NULL OR d.department_id = ?)
       AND (? IS NULL OR a.status = ?)`,
    [from, from, to, to, patientId, patientId, doctorId, doctorId, departmentId, departmentId, status, status]
  );
  return Number(rows[0].c);
}

async function reportDoctors(from, to, departmentId, q, limit, offset) {
  const [rows] = await execute(pool, 'reports/004_report_doctors.sql', [
    from, from, to, to, departmentId, departmentId, q, q, q, limit, offset,
  ]);
  return rows;
}

async function countReportDoctors(from, to, departmentId, q) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM doctors d
     JOIN departments dept ON dept.department_id = d.department_id
     WHERE (? IS NULL OR ? = '1' OR d.department_id = ?)
       AND (? IS NULL
            OR d.full_name LIKE CONCAT('%', ?, '%')
            OR d.specialization LIKE CONCAT('%', ?, '%'))`,
    [departmentId, departmentId, departmentId, q, q, q]
  );
  return Number(rows[0].c);
}

async function reportDepartments(from, to, limit, offset) {
  const [rows] = await execute(pool, 'reports/005_report_departments.sql', [
    from, from, to, to, limit, offset,
  ]);
  return rows;
}

async function countReportDepartments(from, to) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM departments`,
    []
  );
  return Number(rows[0].c);
}

async function reportRevenue(from, to, paymentMethod, limit, offset) {
  const [rows] = await execute(pool, 'reports/006_report_revenue.sql', [
    from, from, to, to, paymentMethod, paymentMethod, limit, offset,
  ]);
  return rows;
}

async function countReportRevenue(from, to, paymentMethod) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM payments
     WHERE (? IS NULL OR paid_at >= ?)
       AND (? IS NULL OR paid_at < ?)
       AND (? IS NULL OR payment_method = ?)`,
    [from, from, to, to, paymentMethod, paymentMethod]
  );
  return Number(rows[0].c);
}

async function reportOutstandingBills(q, status, limit, offset) {
  const [rows] = await execute(pool, 'reports/007_report_outstanding_bills.sql', [
    q, q, q, status, status, limit, offset,
  ]);
  return rows;
}

async function countReportOutstandingBills(q, status) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM bills b
     JOIN patients p ON p.patient_id = b.patient_id
     WHERE (? IS NULL
            OR p.full_name LIKE CONCAT('%', ?, '%')
            OR b.bill_number LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR b.status = ?)
       AND b.outstanding_amount > 0`,
    [q, q, q, status, status]
  );
  return Number(rows[0].c);
}

async function reportPayments(from, to, paymentMethod, patientId, limit, offset) {
  const [rows] = await execute(pool, 'reports/008_report_payments.sql', [
    from, from, to, to, paymentMethod, paymentMethod, patientId, patientId, limit, offset,
  ]);
  return rows;
}

async function countReportPayments(from, to, paymentMethod, patientId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM payments py
     JOIN bills b ON b.bill_id = py.bill_id
     WHERE (? IS NULL OR py.paid_at >= ?)
       AND (? IS NULL OR py.paid_at < ?)
       AND (? IS NULL OR py.payment_method = ?)
       AND (? IS NULL OR b.patient_id = ?)`,
    [from, from, to, to, paymentMethod, paymentMethod, patientId, patientId]
  );
  return Number(rows[0].c);
}

async function reportMedicineStock(q, category, limit, offset) {
  const [rows] = await execute(pool, 'reports/009_report_medicine_stock.sql', [
    q, q, q, category, category, limit, offset,
  ]);
  return rows;
}

async function countReportMedicineStock(q, category) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM medicines
     WHERE (? IS NULL
            OR medicine_name LIKE CONCAT('%', ?, '%')
            OR generic_name LIKE CONCAT('%', ?, '%'))
       AND (? IS NULL OR category = ?)`,
    [q, q, q, category, category]
  );
  return Number(rows[0].c);
}

async function reportPrescriptions(from, to, patientId, doctorId, limit, offset) {
  const [rows] = await execute(pool, 'reports/010_report_prescriptions.sql', [
    from, from, to, to, patientId, patientId, doctorId, doctorId, limit, offset,
  ]);
  return rows;
}

async function countReportPrescriptions(from, to, patientId, doctorId) {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS c FROM prescriptions pr
     WHERE (? IS NULL OR pr.prescribed_at >= ?)
       AND (? IS NULL OR pr.prescribed_at < ?)
       AND (? IS NULL OR pr.patient_id = ?)
       AND (? IS NULL OR pr.doctor_id = ?)`,
    [from, from, to, to, patientId, patientId, doctorId, doctorId]
  );
  return Number(rows[0].c);
}

module.exports = {
  reportPatients, countReportPatients,
  reportAppointments, countReportAppointments,
  reportDoctors, countReportDoctors,
  reportDepartments, countReportDepartments,
  reportRevenue, countReportRevenue,
  reportOutstandingBills, countReportOutstandingBills,
  reportPayments, countReportPayments,
  reportMedicineStock, countReportMedicineStock,
  reportPrescriptions, countReportPrescriptions,
};