'use strict';

/**
 * src/middleware/security-headers.js
 *
 * Helmet-based secure HTTP headers.
 */

const helmet = require('helmet');

function securityHeaders(app) {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
    })
  );
}

module.exports = securityHeaders;