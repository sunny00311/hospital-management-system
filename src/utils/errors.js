'use strict';

/**
 * src/utils/errors.js
 *
 * Typed application errors used by services to signal known failure modes to
 * controllers, which map them to safe responses.
 */

class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', field = null) {
    super(message, 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
};