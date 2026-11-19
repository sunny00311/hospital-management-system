'use strict';

/**
 * src/middleware/validate-request.js
 *
 * Shared request validation middleware for route IDs and common query filters.
 * Validates that IDs are positive integers and normalizes query filters.
 */

const { ValidationError } = require('../utils/validators');

function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).render('errors/404', {
      title: 'Not found',
      message: 'The requested resource was not found.',
    });
  }
  req.validatedId = id;
  next();
}

function validatePositiveIntParam(paramName) {
  return (req, res, next) => {
    const raw = req.params[paramName] || req.body[paramName];
    if (raw === undefined || raw === null) {
      return res.status(404).render('errors/404', {
        title: 'Not found',
        message: 'The requested resource was not found.',
      });
    }
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(404).render('errors/404', {
        title: 'Not found',
        message: 'The requested resource was not found.',
      });
    }
    req[paramName] = id;
    next();
  };
}

function validateFilters(req, res, next) {
  // Normalize common query filters used across list/report routes.
  const q = (req.query.q || '').trim();
  req.filters = {
    q: q || null,
    from: req.query.from || null,
    to: req.query.to || null,
    status: req.query.status || null,
    department_id: req.query.department_id || null,
    doctor_id: req.query.doctor_id || null,
    patient_id: req.query.patient_id || null,
    payment_method: req.query.payment_method || null,
    page: Number(req.query.page) || 1,
    limit: Math.min(100, Math.max(1, Number(req.query.limit) || 10)),
  };
  next();
}

module.exports = { validateId, validatePositiveIntParam, validateFilters };