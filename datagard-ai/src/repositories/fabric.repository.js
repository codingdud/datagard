const sql = require('mssql');
const config = require('../config');
const HttpError = require('../utils/httpError');
const auth = require('./fabricAuth');

let poolPromise;
let poolToken;

// The pool is bound to the access token it was opened with. When the token rotates
// (expiry, or a forced refresh after a failed login) a new pool is opened and the old one drained.
async function getPool({ force = false } = {}) {
  const f = config.fabric;
  if (!f.isConfigured) {
    throw new HttpError(503, 'Microsoft Fabric is not configured. Set AZURE_* and FABRIC_* in .env');
  }
  const token = await auth.getToken({ force });
  if (poolPromise && poolToken === token) return poolPromise;

  const old = poolPromise;
  poolToken = token;
  poolPromise = new sql.ConnectionPool({
    server: f.server,
    database: f.database,
    authentication: { type: 'azure-active-directory-access-token', options: { token } },
    options: { encrypt: true },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  })
    .connect()
    .catch((err) => { poolPromise = undefined; poolToken = undefined; throw err; });

  if (old) setTimeout(() => old.then((p) => p.close()).catch(() => {}), 30000).unref();
  return poolPromise;
}

const isAuthError = (err) => err?.code === 'ELOGIN' || /could not login|login failed|authentication failed/i.test(err?.message || '');

// Run fn(pool). If Fabric rejects the login, fetch a fresh token from Entra ID and retry once.
async function withAuthRetry(fn) {
  try {
    return await fn(await getPool());
  } catch (err) {
    if (!isAuthError(err)) throw wrap(err);
    console.warn('[fabric] login failed, requesting a new token and retrying once');
    auth.invalidate();
    try {
      return await fn(await getPool({ force: true }));
    } catch (retryErr) {
      throw wrap(retryErr);
    }
  }
}

// Fabric Warehouse has no NVARCHAR, and datetime2 tops out at precision 6.
function bind(request, params) {
  for (const [name, v] of Object.entries(params)) {
    if (v instanceof Date) request.input(name, sql.DateTime2(6), v);
    else if (typeof v === 'boolean') request.input(name, sql.Bit, v);
    else if (typeof v === 'number') request.input(name, Number.isInteger(v) ? sql.Int : sql.Float, v);
    else request.input(name, sql.VarChar, v == null ? null : String(v));
  }
  return request;
}

function wrap(err) {
  if (err instanceof HttpError) return err;
  console.error('[fabric]', err.message);
  const e = new HttpError(502, 'Fabric query failed');
  if (config.env === 'development') e.message += `: ${err.message}`;
  return e;
}

// Returns rows
const query = (text, params = {}) =>
  withAuthRetry(async (pool) => (await bind(pool.request(), params).query(text)).recordset || []);

// work(run) where run(text, params) -> { rows, affected }.
// A failed login can only happen while connecting, before any statement ran, so retrying is safe.
const transaction = (work) =>
  withAuthRetry(async (pool) => {
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      const run = async (text, params = {}) => {
        const r = await bind(tx.request(), params).query(text);
        return { rows: r.recordset || [], affected: r.rowsAffected?.[0] ?? 0 };
      };
      const out = await work(run);
      await tx.commit();
      return out;
    } catch (err) {
      try { await tx.rollback(); } catch { /* already aborted */ }
      throw err;
    }
  });

const ping = () => query('SELECT 1 AS ok');

module.exports = { query, transaction, ping };
