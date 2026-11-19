'use strict';

/**
 * src/controllers/doctors.controller.js
 */

const doctorsService = require('../services/doctors.service');
const doctorsRepo = require('../repositories/doctors.repository');
const departmentsRepo = require('../repositories/departments.repository');
const { setFlash } = require('../middleware/flash');
const { ValidationError } = require('../utils/validators');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function index(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { q, department_id, status } = req.query;
  const { rows, count } = await doctorsService.listDoctors(q, department_id, status, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('doctors/index', {
    title: 'Doctors',
    doctors: rows,
    meta,
    filters: { q: q || '', department_id: department_id || '', status: status || '' },
  });
}

async function createForm(req, res) {
  const departments = await departmentsRepo.listDepartments(1000, 0);
  res.render('doctors/form', { title: 'Add Doctor', doctor: null, departments, errors: null });
}

async function create(req, res) {
  try {
    await doctorsService.createDoctor(req.body);
    setFlash(req, 'success', 'Doctor created successfully.');
    res.redirect('/doctors');
  } catch (err) {
    if (err instanceof ValidationError) {
      const departments = await departmentsRepo.listDepartments(1000, 0);
      return res.status(400).render('doctors/form', {
        title: 'Add Doctor',
        doctor: req.body,
        departments,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect('/doctors/new');
  }
}

async function show(req, res) {
  const doctor = await doctorsService.showDoctor(req.validatedId);
  const appointments = await doctorsRepo.doctorAppointments(req.validatedId, null, null, 10, 0);
  res.render('doctors/show', { title: doctor.full_name, doctor, appointments });
}

async function editForm(req, res) {
  const doctor = await doctorsService.showDoctor(req.validatedId);
  const departments = await departmentsRepo.listDepartments(1000, 0);
  res.render('doctors/form', { title: 'Edit Doctor', doctor, departments, errors: null });
}

async function update(req, res) {
  try {
    await doctorsService.updateDoctor(req.validatedId, req.body);
    setFlash(req, 'success', 'Doctor updated successfully.');
    res.redirect(`/doctors/${req.validatedId}`);
  } catch (err) {
    if (err instanceof ValidationError) {
      const doctor = await doctorsService.showDoctor(req.validatedId);
      const departments = await departmentsRepo.listDepartments(1000, 0);
      return res.status(400).render('doctors/form', {
        title: 'Edit Doctor',
        doctor: { ...doctor, ...req.body },
        departments,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/doctors/${req.validatedId}/edit`);
  }
}

async function updateStatus(req, res) {
  try {
    const isActive = req.body.is_active === '1' ? 1 : 0;
    await doctorsService.updateDoctorStatus(req.validatedId, isActive);
    setFlash(req, 'success', `Doctor ${isActive ? 'activated' : 'deactivated'}.`);
    res.redirect(`/doctors/${req.validatedId}`);
  } catch (err) {
    setFlash(req, 'error', err.message);
    res.redirect(`/doctors/${req.validatedId}`);
  }
}

module.exports = { index, createForm, create, show, editForm, update, updateStatus };