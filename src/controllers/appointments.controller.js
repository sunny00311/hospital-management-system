'use strict';

/**
 * src/controllers/appointments.controller.js
 */

const appointmentsService = require('../services/appointments.service');
const patientsRepo = require('../repositories/patients.repository');
const doctorsRepo = require('../repositories/doctors.repository');
const { setFlash } = require('../middleware/flash');
const { ValidationError, ConflictError } = require('../utils/errors');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function index(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { from, to, patient_id, doctor_id, department_id, status } = req.query;
  const { rows, count } = await appointmentsService.listAppointments(
    from, to, patient_id, doctor_id, department_id, status, page, limit
  );
  const meta = buildMeta(page, limit, count);

  // Load patients and doctors for filter dropdowns
  const [patients, doctors] = await Promise.all([
    patientsRepo.listPatients(null, null, null, 1000, 0),
    doctorsRepo.listDoctors(null, null, null, 1000, 0),
  ]);

  res.render('appointments/index', {
    title: 'Appointments',
    appointments: rows,
    meta,
    patients,
    doctors,
    filters: {
      from: from || '',
      to: to || '',
      patient_id: patient_id || '',
      doctor_id: doctor_id || '',
      department_id: department_id || '',
      status: status || '',
    },
  });
}

async function createForm(req, res) {
  // Load patients and active doctors for the form
  const [patients, doctors] = await Promise.all([
    patientsRepo.listPatients(null, null, null, 1000, 0),
    doctorsRepo.listDoctors(null, null, 'active', 1000, 0),
  ]);
  res.render('appointments/form', {
    title: 'Book Appointment',
    appointment: null,
    patients,
    doctors,
    errors: null,
  });
}

async function create(req, res) {
  try {
    const appointmentId = await appointmentsService.bookAppointment(req.body);
    setFlash(req, 'success', 'Appointment booked successfully.');
    res.redirect(`/appointments/${appointmentId}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const [patients, doctors] = await Promise.all([
        patientsRepo.listPatients(null, null, null, 1000, 0),
        doctorsRepo.listDoctors(null, null, 'active', 1000, 0),
      ]);
      return res.status(400).render('appointments/form', {
        title: 'Book Appointment',
        appointment: req.body,
        patients,
        doctors,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    if (err instanceof ConflictError) {
      const [patients, doctors] = await Promise.all([
        patientsRepo.listPatients(null, null, null, 1000, 0),
        doctorsRepo.listDoctors(null, null, 'active', 1000, 0),
      ]);
      return res.status(409).render('appointments/form', {
        title: 'Book Appointment',
        appointment: req.body,
        patients,
        doctors,
        errors: { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect('/appointments/new');
  }
}

async function show(req, res) {
  const appointment = await appointmentsService.showAppointment(req.validatedId);
  res.render('appointments/show', { title: `Appointment #${appointment.appointment_id}`, appointment });
}

async function updateStatus(req, res) {
  try {
    await appointmentsService.updateStatus(req.validatedId, req.body.status);
    setFlash(req, 'success', `Appointment status updated to ${req.body.status}.`);
    res.redirect(`/appointments/${req.validatedId}`);
  } catch (err) {
    setFlash(req, 'error', err.message);
    res.redirect(`/appointments/${req.validatedId}`);
  }
}

// Need to add listAppointments method to appointments service
module.exports = { index, createForm, create, show, updateStatus };