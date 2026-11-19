'use strict';

/**
 * src/controllers/medicines.controller.js
 */

const medicinesService = require('../services/medicines.service');
const { setFlash } = require('../middleware/flash');
const { ValidationError } = require('../utils/validators');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { validateId } = require('../middleware/validate-request');

async function index(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { q, category } = req.query;
  const { rows, count } = await medicinesService.listMedicines(q, category, page, limit);
  const meta = buildMeta(page, limit, count);
  res.render('medicines/index', {
    title: 'Medicines',
    medicines: rows,
    meta,
    filters: { q: q || '', category: category || '' },
  });
}

async function createForm(req, res) {
  res.render('medicines/form', { title: 'Add Medicine', medicine: null, errors: null });
}

async function create(req, res) {
  try {
    await medicinesService.createMedicine(req.body);
    setFlash(req, 'success', 'Medicine added successfully.');
    res.redirect('/medicines');
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).render('medicines/form', {
        title: 'Add Medicine',
        medicine: req.body,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect('/medicines/new');
  }
}

async function editForm(req, res) {
  const medicine = await medicinesService.showMedicine(req.validatedId);
  res.render('medicines/form', { title: 'Edit Medicine', medicine, errors: null });
}

async function update(req, res) {
  try {
    await medicinesService.updateMedicine(req.validatedId, req.body);
    setFlash(req, 'success', 'Medicine updated successfully.');
    res.redirect('/medicines');
  } catch (err) {
    if (err instanceof ValidationError) {
      const medicine = await medicinesService.showMedicine(req.validatedId);
      return res.status(400).render('medicines/form', {
        title: 'Edit Medicine',
        medicine: { ...medicine, ...req.body },
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/medicines/${req.validatedId}/edit`);
  }
}

async function adjustStockForm(req, res) {
  const medicine = await medicinesService.showMedicine(req.validatedId);
  res.render('medicines/stock', { title: 'Adjust Stock', medicine, errors: null });
}

async function adjustStock(req, res) {
  try {
    await medicinesService.adjustStock(req.validatedId, req.body, req.session.user.user_id);
    setFlash(req, 'success', 'Stock adjusted successfully.');
    res.redirect('/medicines');
  } catch (err) {
    if (err instanceof ValidationError) {
      const medicine = await medicinesService.showMedicine(req.validatedId);
      return res.status(400).render('medicines/stock', {
        title: 'Adjust Stock',
        medicine,
        errors: err.field ? { [err.field]: err.message } : { general: err.message },
      });
    }
    setFlash(req, 'error', err.message);
    res.redirect(`/medicines/${req.validatedId}/stock-adjustment`);
  }
}

async function showMovements(req, res) {
  const { page, limit } = parsePagination(req.query);
  const { rows, medicine } = await medicinesService.showStockMovements(req.validatedId, page, limit);
  const meta = buildMeta(page, limit, rows.length);
  res.render('medicines/movements', { title: 'Stock Movements', medicine, movements: rows, meta });
}

module.exports = { index, createForm, create, editForm, update, adjustStockForm, adjustStock, showMovements };