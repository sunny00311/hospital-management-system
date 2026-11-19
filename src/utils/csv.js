'use strict';

/**
 * src/utils/csv.js
 *
 * Server-side CSV generation with formula-injection mitigation.
 * Escapes cells beginning with =, +, -, or @ by prefixing a single quote.
 */

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let s = String(value);
  if (s.startsWith('=') || s.startsWith('+') || s.startsWith('-') || s.startsWith('@')) {
    s = "'" + s;
  }
  // Escape embedded quotes and newlines.
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCsv(rows, columns) {
  const header = columns.map((c) => escapeCell(c.label)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => escapeCell(row[c.key])).join(',')
  ).join('\n');
  return header + '\r\n' + body + '\r\n';
}

function csvResponse(res, filename, rows, columns) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.write(buildCsv(rows, columns));
}

module.exports = { escapeCell, buildCsv, csvResponse };