'use strict';

/**
 * src/utils/async-handler.js
 *
 * Wraps async route handlers so rejected promises forward to the centralized
 * error handler instead of crashing the process.
 */

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;