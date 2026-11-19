'use strict';

/**
 * src/repositories/auth.repository.js
 *
 * Data-access layer for authentication. Executes parameterized SQL from
 * database/queries/ and maps results. Never reads Express request/response
 * objects.
 */

const pool = require('../config/db');
const { execute } = require('../utils/sql-loader');

async function findUserByUsername(username) {
  const [rows] = await execute(pool, 'billing/040_show_user_by_username.sql', [username]);
  return rows[0] || null;
}

async function updateLastLogin(userId) {
  await execute(pool, 'billing/041_update_user_last_login.sql', [userId]);
}

module.exports = { findUserByUsername, updateLastLogin };