'use strict';

/**
 * src/utils/validators.js
 *
 * Server-side input validation helpers. All request input is validated here
 * before reaching controllers/services. Returns a sanitized value or throws
 * a ValidationError with a message safe for display.
 */

class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-() ]{7,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/;

function nonEmpty(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function trim(value) {
  return value === undefined || value === null ? '' : String(value).trim();
}

function requireStr(value, field, maxLen = 255) {
  const s = trim(value);
  if (!s) throw new ValidationError(`${field} is required.`, field);
  if (s.length > maxLen) throw new ValidationError(`${field} must be ${maxLen} characters or fewer.`, field);
  return s;
}

function optionalStr(value, field, maxLen = 500) {
  const s = trim(value);
  if (!s) return null;
  if (s.length > maxLen) throw new ValidationError(`${field} must be ${maxLen} characters or fewer.`, field);
  return s;
}

function requireInt(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new ValidationError(`${field} must be a non-negative integer.`, field);
  return n;
}

function requirePositiveInt(value, field) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new ValidationError(`${field} must be a positive integer.`, field);
  return n;
}

function requireDecimal(value, field) {
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) throw new ValidationError(`${field} must be a non-negative number.`, field);
  return n;
}

function requireDate(value, field) {
  const s = trim(value);
  if (!DATE_RE.test(s)) throw new ValidationError(`${field} must be a valid date (YYYY-MM-DD).`, field);
  return s;
}

function requireDateTime(value, field) {
  const s = trim(value);
  if (!DATETIME_RE.test(s)) throw new ValidationError(`${field} must be a valid date and time.`, field);
  return s;
}

function requireEnum(value, allowed, field) {
  if (!allowed.includes(value)) throw new ValidationError(`Invalid ${field}.`, field);
  return value;
}

function requireEmail(value, field) {
  const s = trim(value);
  if (!EMAIL_RE.test(s)) throw new ValidationError(`${field} must be a valid email address.`, field);
  return s;
}

function requirePhone(value, field) {
  const s = trim(value);
  if (!PHONE_RE.test(s)) throw new ValidationError(`${field} must be a valid phone number.`, field);
  return s;
}

function optionalPhone(value, field) {
  const s = trim(value);
  if (!s) return null;
  if (!PHONE_RE.test(s)) throw new ValidationError(`${field} must be a valid phone number.`, field);
  return s;
}

function optionalEmail(value, field) {
  const s = trim(value);
  if (!s) return null;
  if (!EMAIL_RE.test(s)) throw new ValidationError(`${field} must be a valid email address.`, field);
  return s;
}

function requireBool(value, field) {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  throw new ValidationError(`${field} must be true or false.`, field);
}

module.exports = {
  ValidationError,
  nonEmpty,
  trim,
  requireStr,
  optionalStr,
  requireInt,
  requirePositiveInt,
  requireDecimal,
  requireDate,
  requireDateTime,
  requireEnum,
  requireEmail,
  requirePhone,
  optionalPhone,
  optionalEmail,
  requireBool,
};