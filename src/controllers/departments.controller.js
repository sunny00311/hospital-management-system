'use strict';

/**
 * src/controllers/departments.controller.js
 */

const departmentsService = require('../services/departments.service');
const { setFlash } = require('../middleware/flash');
const { ValidationError } = require('../utils/validators');
const { parsePagination, buildMeta } = require('../utils/pagination');

async function index(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { rows, count } = await departmentsService.listDepartments(page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('departments/index', {
    title: 'Departments',
    departments: rows,
    meta,
  });
}

async function createForm(req, res) {
  res.render('departments/form', { title: 'Add Department', department: null, errors: null });
}

async function create(req, res) {
  try {
    await departmentsService.createDepartment(req.body);
    setFlash(req, 'success', 'Department created successfully.');
    res.redirect('/departments');
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).render('departments/form', {
        title: 'Add Department',
        department: req.body,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect('/departments/new');
  }
}

module.exports = { index, createForm, create };