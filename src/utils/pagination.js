'use strict';

/**
 * src/utils/pagination.js
 *
 * Pagination helpers: parse and bound page/limit query parameters, and produce
 * page metadata for templates.
 */

const MAX_LIMIT = 100;

function parsePagination(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || 10));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildMeta(page, limit, total) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    pages,
    has_prev: page > 1,
    has_next: page < pages,
  };
}

module.exports = { parsePagination, buildMeta, MAX_LIMIT };