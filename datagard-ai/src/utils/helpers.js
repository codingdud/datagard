const crypto = require('crypto');
const HttpError = require('./httpError');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// "[\"a\",\"b\"]" | "a,b" | array | null  ->  string[]
const parseList = (v) => {
  if (v == null || v === '') return [];
  if (Array.isArray(v)) return v.map(String);
  const s = String(v).trim();
  if (s.startsWith('[')) {
    try { return JSON.parse(s).map(String); } catch { /* fall through */ }
  }
  return s.split(',').map((x) => x.trim()).filter(Boolean);
};

const parsePaging = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize, 10) || 20, 1), 100);
  return { page, pageSize, offset: (page - 1) * pageSize };
};

const oneOf = (value, allowed, name) => {
  if (value == null || value === '') return null;
  const v = String(value).toUpperCase();
  if (!allowed.includes(v)) throw new HttpError(400, `${name} must be one of: ${allowed.join(', ')}`);
  return v;
};

const newId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

const round1 = (n) => (n == null ? null : Math.round(Number(n) * 10) / 10);

module.exports = { asyncHandler, parseList, parsePaging, oneOf, newId, round1 };
