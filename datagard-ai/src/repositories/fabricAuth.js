// Microsoft Entra ID (client-credentials) token for the Fabric SQL endpoint.
// Same call as:
//   POST https://login.microsoftonline.com/<tenant>/oauth2/v2.0/token
//   client_id, client_secret, scope=https://database.windows.net/.default, grant_type=client_credentials
const config = require('../config');
const HttpError = require('../utils/httpError');

const REFRESH_SKEW_MS = 5 * 60 * 1000; // renew 5 minutes before expiry

let cache = null; // { token, expiresAt }
let inflight = null; // dedupe concurrent refreshes

async function requestToken() {
  const { tenantId, clientId, clientSecret, scope } = config.fabric;
  let res;
  try {
    res = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, scope, grant_type: 'client_credentials' }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    throw new HttpError(502, `Fabric auth failed: could not reach Entra ID (${err.message})`);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    // error_description contains the AADSTS code (e.g. invalid secret, wrong tenant); it never echoes the secret.
    const reason = String(body.error_description || body.error || `HTTP ${res.status}`).split('\r\n')[0].slice(0, 200);
    throw new HttpError(502, `Fabric auth failed: ${reason}`);
  }
  return { token: body.access_token, expiresAt: Date.now() + Math.max(Number(body.expires_in) * 1000 - REFRESH_SKEW_MS, 0) };
}

async function getToken({ force = false } = {}) {
  if (!force && cache && Date.now() < cache.expiresAt) return cache.token;
  if (!inflight) {
    inflight = requestToken()
      .then((t) => { cache = t; return t; })
      .finally(() => { inflight = null; });
  }
  return (await inflight).token;
}

const invalidate = () => { cache = null; };

module.exports = { getToken, invalidate };
