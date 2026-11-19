'use strict';

/**
 * src/controllers/reports.controller.js
 */

const reportsRepo = require('../repositories/reports.repository');
const { csvResponse } = require('../utils/csv');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { requireAuth } = require('../middleware/require-auth');
const { authorize } = require('../middleware/authorize');

const REPORT_KEYS = [
  'patients', 'appointments', 'doctors', 'departments',
  'revenue', 'outstanding-bills', 'payments', 'medicine-stock', 'prescriptions',
];

async function index(req, res) {
  res.render('reports/index', { title: 'Reports', reports: REPORT_KEYS });
}

async function patients(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { q, from, to } = req.query;
  const { rows, count } = await reportsRepo.reportPatients(q, from, to, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('reports/patients', {
    title: 'Patient Register',
    patients: rows,
    meta,
    filters: { q: q || '', from: from || '', to: to || '' },
  });
}

async function appointments(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, patient_id, doctor_id, department_id, status } = req.query;
  const { rows, count } = await reportsRepo.reportAppointments(
    from, to, patient_id, doctor_id, department_id, status, page, limit
  );
  const meta = buildMeta(page, limit, count);
  const [patients, doctors, departments] = await Promise.all([
    require('../repositories/patients.repository').listPatients(null, null, null, 1000, 0),
    require('../repositories/doctors.repository').listDoctors(null, null, 'active', 1000, 0),
    require('../repositories/departments.repository').listDepartments(1000, 0),
  ]);
  res.render('reports/appointments', {
    title: 'Appointments Report',
    appointments: rows,
    meta,
    patients,
    doctors,
    departments,
    filters: { from: from || '', to: to || '', patient_id: patient_id || '', doctor_id: doctor_id || '', department_id: department_id || '', status: status || '' },
  });
}

async function doctors(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, department_id, q } = req.query;
  const { rows, count } = await reportsRepo.reportDoctors(from, to, department_id, q, page, limit);
  const meta = buildMeta(page, limit, count);
  const departments = await require('../repositories/departments.repository').listDepartments(1000, 0);
  res.render('reports/doctors', {
    title: 'Doctor Workload',
    doctors: rows,
    meta,
    departments,
    filters: { from: from || '', to: to || '', department_id: department_id || '', q: q || '' },
  });
}

async function departments(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to } = req.query;
  const { rows, count } = await reportsRepo.reportDepartments(from, to, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('reports/departments', {
    title: 'Department Summary',
    departments: rows,
    meta,
    filters: { from: from || '', to: to || '' },
  });
}

async function revenue(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, payment_method } = req.query;
  const { rows, count } = await reportsRepo.reportRevenue(from, to, payment_method, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('reports/revenue', {
    title: 'Revenue Report',
    revenue: rows,
    meta,
    filters: { from: from || '', to: to || '', payment_method: payment_method || '' },
  });
}

async function outstandingBills(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { q, status } = req.query;
  const { rows, count } = await reportsRepo.reportOutstandingBills(q, status, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('reports/outstanding-bills', {
    title: 'Outstanding Bills',
    bills: rows,
    meta,
    filters: { q: q || '', status: status || '' },
  });
}

async function payments(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, payment_method, patient_id } = req.query;
  const { rows, count } = await reportsRepo.reportPayments(from, to, payment_method, patient_id, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('reports/payments', {
    title: 'Payment History',
    payments: rows,
    meta,
    filters: { from: from || '', to: to || '', payment_method: payment_method || '', patient_id: patient_id || '' },
  });
}

async function medicineStock(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { q, category } = req.query;
  const { rows, count } = await reportsRepo.reportMedicineStock(q, category, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('reports/medicine-stock', {
    title: 'Medicine Stock',
    medicines: rows,
    meta,
    filters: { q: q || '', category: category || '' },
  });
}

async function prescriptions(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, patient_id, doctor_id } = req.query;
  const { rows, count } = await reportsRepo.reportPrescriptions(from, to, patient_id, doctor_id, page, limit);
  const meta = buildMeta(page, limit, count);
  const [patients, doctors] = await Promise.all([
    require('../repositories/patients.repository').listPatients(null, null, null, 1000, 0),
    require('../repositories/doctors.repository').listDoctors(null, null, 'active', 1000, 0),
  ]);
  res.render('reports/prescriptions', {
    title: 'Prescriptions Report',
    prescriptions: rows,
    meta,
    patients,
    doctors,
    filters: { from: from || '', to: to || '', patient_id: patient_id || '', doctor_id: doctor_id || '' },
  });
}

async function exportCsv(req, res) {
  const { reportKey } = req.params;
  if (!REPORT_KEYS.includes(reportKey)) {
    return res.status(404).render('errors/404', { title: 'Not found', message: 'Report not found.' });
  }

  // For CSV, we export without pagination limit (or a generous limit)
  const limit = 5000;
  const page = 1;

  try {
    let rows = [];
    let columns = [];
    let filename = `${reportKey}-${new Date().toISOString().slice(0, 10)}.csv`;

    switch (reportKey) {
      case 'patients': {
        const { q, from, to } = req.query;
        const result = await reportsRepo.reportPatients(q, from, to, limit, 0);
        rows = result;
        columns = [
          { key: 'patient_id', label: 'Patient ID' },
          { key: 'full_name', label: 'Name' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'date_of_birth', label: 'DOB' },
          { key: 'registration_date', label: 'Registered' },
        ];
        break;
      }
      case 'appointments': {
        const { from, to, patient_id, doctor_id, department_id, status } = req.query;
        rows = await reportsRepo.reportAppointments(from, to, patient_id, doctor_id, department_id, status, limit, 0);
        columns = [
          { key: 'appointment_id', label: 'Appointment ID' },
          { key: 'appointment_at', label: 'Date/Time' },
          { key: 'duration_minutes', label: 'Duration (min)' },
          { key: 'status', label: 'Status' },
          { key: 'reason', label: 'Reason' },
          { key: 'patient_name', label: 'Patient' },
          { key: 'doctor_name', label: 'Doctor' },
          { key: 'department_name', label: 'Department' },
        ];
        break;
      }
      case 'doctors': {
        const { from, to, department_id, q } = req.query;
        rows = await reportsRepo.reportDoctors(from, to, department_id, q, limit, 0);
        columns = [
          { key: 'doctor_id', label: 'Doctor ID' },
          { key: 'doctor_name', label: 'Name' },
          { key: 'specialization', label: 'Specialization' },
          { key: 'department_name', label: 'Department' },
          { key: 'total_appointments', label: 'Total' },
          { key: 'completed_count', label: 'Completed' },
          { key: 'cancelled_count', label: 'Cancelled' },
          { key: 'no_show_count', label: 'No-show' },
          { key: 'scheduled_count', label: 'Scheduled' },
        ];
        break;
      }
      case 'departments': {
        const { from, to } = req.query;
        rows = await reportsRepo.reportDepartments(from, to, limit, 0);
        columns = [
          { key: 'department_id', label: 'Department ID' },
          { key: 'department_name', label: 'Name' },
          { key: 'doctor_count', label: 'Doctors' },
          { key: 'appointment_count', label: 'Appointments' },
        ];
        break;
      }
      case 'revenue': {
        const { from, to, payment_method } = req.query;
        rows = await reportsRepo.reportRevenue(from, to, payment_method, limit, 0);
        columns = [
          { key: 'revenue_month', label: 'Month' },
          { key: 'payment_count', label: 'Payments' },
          { key: 'collected_amount', label: 'Collected' },
        ];
        break;
      }
      case 'outstanding-bills': {
        const { q, status } = req.query;
        rows = await reportsRepo.reportOutstandingBills(q, status, limit, 0);
        columns = [
          { key: 'bill_id', label: 'Bill ID' },
          { key: 'bill_number', label: 'Bill Number' },
          { key: 'patient_name', label: 'Patient' },
          { key: 'status', label: 'Status' },
          { key: 'total_amount', label: 'Total' },
          { key: 'paid_amount', label: 'Paid' },
          { key: 'outstanding_amount', label: 'Outstanding' },
          { key: 'bill_date', label: 'Bill Date' },
          { key: 'due_date', label: 'Due Date' },
        ];
        break;
      }
      case 'payments': {
        const { from, to, payment_method, patient_id } = req.query;
        rows = await reportsRepo.reportPayments(from, to, payment_method, patient_id, limit, 0);
        columns = [
          { key: 'payment_id', label: 'Payment ID' },
          { key: 'payment_number', label: 'Payment Number' },
          { key: 'bill_id', label: 'Bill ID' },
          { key: 'bill_number', label: 'Bill Number' },
          { key: 'patient_name', label: 'Patient' },
          { key: 'amount', label: 'Amount' },
          { key: 'payment_method', label: 'Method' },
          { key: 'reference', label: 'Reference' },
          { key: 'paid_at', label: 'Date' },
        ];
        break;
      }
      case 'medicine-stock': {
        const { q, category } = req.query;
        rows = await reportsRepo.reportMedicineStock(q, category, limit, 0);
        columns = [
          { key: 'medicine_id', label: 'Medicine ID' },
          { key: 'medicine_name', label: 'Name' },
          { key: 'generic_name', label: 'Generic' },
          { key: 'category', label: 'Category' },
          { key: 'unit_price', label: 'Unit Price' },
          { key: 'stock_quantity', label: 'Stock' },
          { key: 'reorder_level', label: 'Reorder Level' },
          { key: 'unit', label: 'Unit' },
          { key: 'low_stock', label: 'Low Stock' },
        ];
        break;
      }
      case 'prescriptions': {
        const { from, to, patient_id, doctor_id } = req.query;
        rows = await reportsRepo.reportPrescriptions(from, to, patient_id, doctor_id, limit, 0);
        columns = [
          { key: 'prescription_id', label: 'Prescription ID' },
          { key: 'prescribed_at', label: 'Date' },
          { key: 'status', label: 'Status' },
          { key: 'patient_name', label: 'Patient' },
          { key: 'doctor_name', label: 'Doctor' },
          { key: 'medicine_name', label: 'Medicine' },
          { key: 'dosage', label: 'Dosage' },
          { key: 'frequency', label: 'Frequency' },
          { key: 'quantity', label: 'Quantity' },
        ];
        break;
      }
    }

    csvResponse(res, filename, rows, columns);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).send('Export failed.');
  }
}

module.exports = {
  index, patients, appointments, doctors, departments, revenue,
  outstandingBills, payments, medicineStock, prescriptions, exportCsv,
};