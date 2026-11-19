'use strict';

/**
 * src/utils/date.js
 *
 * Date helpers for validated filters. Half-open ranges: start inclusive,
 * end exclusive. Filters default to "today" when not supplied.
 */

function parseDate(value) {
  if (!value || String(value).trim() === '') return null;
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return s;
}

function parseDateTime(value) {
  if (!value || String(value).trim() === '') return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  const d = new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4] || '00'}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function todayRange() {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    from: start.toISOString().slice(0, 19).replace('T', ' '),
    to: end.toISOString().slice(0, 19).replace('T', ' '),
  };
}

function periodRange(from, to) {
  const f = parseDate(from);
  const t = parseDate(to);
  if (f && t && f >= t) return null;
  return {
    from: f ? `${f} 00:00:00` : null,
    to: t ? `${t} 00:00:00` : null,
  };
}

module.exports = { parseDate, parseDateTime, todayRange, periodRange };