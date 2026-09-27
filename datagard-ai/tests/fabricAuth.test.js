process.env.NODE_ENV = 'test';
process.env.AZURE_TENANT_ID = 'tenant-1';
process.env.AZURE_CLIENT_ID = 'client-1';
process.env.AZURE_CLIENT_SECRET = 'secret-1';
process.env.FABRIC_SERVER = 'abc.datawarehouse.fabric.microsoft.com';
process.env.FABRIC_DATABASE = 'lakehouse1';

const auth = require('../src/repositories/fabricAuth');

const ok = (token, expires_in = 3599) => ({ ok: true, status: 200, json: async () => ({ access_token: token, expires_in }) });

beforeEach(() => {
  auth.invalidate();
  global.fetch = jest.fn();
});

it('requests a client-credentials token for the database scope', async () => {
  fetch.mockResolvedValueOnce(ok('tok-1'));
  expect(await auth.getToken()).toBe('tok-1');
  const [url, opts] = fetch.mock.calls[0];
  expect(url).toBe('https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token');
  const body = opts.body.toString();
  expect(body).toContain('grant_type=client_credentials');
  expect(body).toContain('scope=https%3A%2F%2Fdatabase.windows.net%2F.default');
});

it('caches the token and only refetches when forced', async () => {
  fetch.mockResolvedValueOnce(ok('tok-1')).mockResolvedValueOnce(ok('tok-2'));
  expect(await auth.getToken()).toBe('tok-1');
  expect(await auth.getToken()).toBe('tok-1');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(await auth.getToken({ force: true })).toBe('tok-2');
});

it('shares one request between concurrent callers', async () => {
  fetch.mockResolvedValueOnce(ok('tok-1'));
  const [a, b] = await Promise.all([auth.getToken(), auth.getToken()]);
  expect([a, b]).toEqual(['tok-1', 'tok-1']);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('treats a token inside the refresh window as expired', async () => {
  fetch.mockResolvedValueOnce(ok('tok-1', 120)).mockResolvedValueOnce(ok('tok-2'));
  await auth.getToken();
  expect(await auth.getToken()).toBe('tok-2');
});

it('surfaces the Entra error without leaking the secret', async () => {
  fetch.mockResolvedValueOnce({
    ok: false, status: 401,
    json: async () => ({ error: 'invalid_client', error_description: 'AADSTS7000215: Invalid client secret provided.\r\nTrace ID: x' }),
  });
  await expect(auth.getToken()).rejects.toMatchObject({ statusCode: 502, message: expect.stringContaining('AADSTS7000215') });
  fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ error_description: 'bad' }) });
  await expect(auth.getToken()).rejects.not.toThrow(/secret-1/);
});
