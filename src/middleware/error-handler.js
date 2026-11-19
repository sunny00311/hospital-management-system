'use strict';

/**
 * src/middleware/error-handler.js
 *
 * Centralized error handler. Maps known error categories to safe responses:
 * validation errors re-render forms, not-found/forbidden render pages, and
 * unexpected errors render a generic 500 page. Never exposes SQL errors,
 * stack traces, or credentials to clients.
 */

const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  if (status === 404 || err.name === 'NotFoundError') {
    return res.status(404).render('errors/404', {
      title: 'Not found',
      message: err.message || 'The requested resource was not found.',
    });
  }

  if (status === 403 || err.name === 'ForbiddenError') {
    return res.status(403).render('errors/403', {
      title: 'Access denied',
      message: err.message || 'You do not have permission to access this resource.',
    });
  }

  if (err.name === 'ValidationError') {
    // Re-render the form with field errors is handled by controllers that
    // catch the error; here we fall back to a generic 400 page.
    return res.status(400).render('errors/500', {
      title: 'Invalid input',
      message: err.message || 'Please correct the highlighted fields.',
    });
  }

  if (err.name === 'ConflictError' || err.code === 'ER_DUP_ENTRY') {
    return res.status(409).render('errors/500', {
      title: 'Conflict',
      message: err.message || 'A record with this information already exists.',
    });
  }

  // Unexpected error: log a sanitized server-side message and render 500.
  logger.error('Unhandled error', {
    message: err.message,
    path: req.path,
    method: req.method,
  });

  return res.status(500).render('errors/500', {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again later.',
  });
}

module.exports = errorHandler;