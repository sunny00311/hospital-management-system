'use strict';

const mysql = require('mysql2/promise');

/**
 * Central database module.
 *
 * Exports ONE shared connection pool. Never create a pool per request.
 * Uses mysql2/promise. All configuration comes from environment variables.
 * TLS follows the cloud provider's certificate instructions; certificate
 * verification is never disabled.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  enableKeepAlive: true,
  dateStrings: true,
  ssl: process.env.DB_SSL_CA
    ? { ca: process.env.DB_SSL_CA }
    : undefined,
});

module.exports = pool;
