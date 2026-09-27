// Standalone check of the Entra ID token flow (no Fabric connection, no DB).
// Usage: npm run check:token
const config = require('../src/config');
const auth = require('../src/repositories/fabricAuth');

(async () => {
  if (!config.fabric.isConfigured) {
    console.error('FAIL: AZURE_* / FABRIC_* are missing or still placeholders in .env');
    process.exit(1);
  }
  const t0 = Date.now();
  const token = await auth.getToken({ force: true });
  const ms = Date.now() - t0;
  const c = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  const cached = await auth.getToken(); // should come from cache, no network call

  console.log('OK: token received in', ms, 'ms (token itself not printed)');
  console.log({
    audience: c.aud,
    tenant: c.tid,
    appId: c.appid,
    type: c.idtyp,
    expires: new Date(c.exp * 1000).toISOString(),
    minutesLeft: Math.round((c.exp * 1000 - Date.now()) / 60000),
    cacheWorks: cached === token,
    length: token.length,
  });
})().catch((e) => {
  console.error('FAIL:', e.message);
  process.exit(1);
});
