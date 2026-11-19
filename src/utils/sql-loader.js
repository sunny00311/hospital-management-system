'use strict';

/**
 * src/utils/sql-loader.js
 *
 * Loads SQL statements from database/queries/ files and executes them with
 * mysql2 bound parameters.
 *
 * Design: SQL text lives in separate .sql files under database/queries/.
 * Route handlers never build SQL strings. This module caches loaded SQL text
 * and exposes execute(sqlFile, values) helpers.
 *
 * Never expose an endpoint that accepts a SQL filename from the browser. The
 * file paths used here are server-side constants.
 */

const fs = require('fs');
const path = require('path');

const QUERIES_DIR = path.join(__dirname, '..', '..', 'database', 'queries');
const _cache = new Map();

function loadSql(relativePath) {
  const full = path.join(QUERIES_DIR, relativePath);
  if (_cache.has(full)) return _cache.get(full);
  const sql = fs.readFileSync(full, 'utf8');
  _cache.set(full, sql);
  return sql;
}

function execute(pool, relativePath, values = []) {
  const sql = loadSql(relativePath);
  return pool.execute(sql, values);
}

module.exports = { loadSql, execute, QUERIES_DIR };