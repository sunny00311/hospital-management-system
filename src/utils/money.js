'use strict';

/**
 * src/utils/money.js
 *
 * Decimal-safe money helpers. All monetary values are DECIMAL in MySQL; these
 * helpers avoid floating-point drift by rounding to two decimal places.
 */

const SCALE = 2;

function round(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * Math.pow(10, SCALE)) / Math.pow(10, SCALE);
}

function add(a, b) {
  return round(Number(a) + Number(b));
}

function subtract(a, b) {
  return round(Number(a) - Number(b));
}

function multiply(a, b) {
  return round(Number(a) * Number(b));
}

function format(value) {
  return round(value).toFixed(SCALE);
}

module.exports = { round, add, subtract, multiply, format, SCALE };