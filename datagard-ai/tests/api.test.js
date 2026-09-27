process.env.NODE_ENV = 'test';
jest.mock('../src/repositories/fabric.repository');

const request = require('supertest');
const repo = require('../src/repositories/fabric.repository');
const app = require('../src/app');
const { parseList } = require('../src/utils/helpers');

beforeEach(() => jest.resetAllMocks());

describe('validation (no Fabric call needed)', () => {
  it('rejects approve without reviewerId', async () => {
    const res = await request(app).post('/api/reviews/REV-1/approve').send({});
    expect(res.statusCode).toBe(400);
    expect(repo.transaction).not.toHaveBeenCalled();
  });

  it('rejects edit without a value', async () => {
    const res = await request(app).post('/api/reviews/REV-1/edit').send({ reviewerId: 'admin' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects an unknown review status filter', async () => {
    const res = await request(app).get('/api/reviews?status=BOGUS');
    expect(res.statusCode).toBe(400);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app).post('/api/reviews/REV-1/reject').set('Content-Type', 'application/json').send('{bad');
    expect(res.statusCode).toBe(400);
  });
});

describe('reads', () => {
  it('maps the decision ledger and paginates', async () => {
    repo.query
      .mockResolvedValueOnce([{ decision_id: 'DEC-1', record_id: 'C1024', field_name: 'department', action: 'CORRECTED', confidence: 0.97, model: 'Fabric AI', decision_type: 'HUMAN_APPROVED' }])
      .mockResolvedValueOnce([{ total: 1 }]);
    const res = await request(app).get('/api/decisions?recordId=C1024&status=approved');
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0]).toMatchObject({ decisionId: 'DEC-1', decision: 'HUMAN_APPROVED', confidence: 0.97 });
    expect(res.body.pagination).toEqual({ page: 1, pageSize: 20, total: 1 });
  });

  it('returns 404 for an unknown decision', async () => {
    repo.query.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/decisions/nope');
    expect(res.statusCode).toBe(404);
  });

  it('shapes pillars by name', async () => {
    repo.query.mockResolvedValueOnce([{ pillar: 'FAIRNESS', score: 93, description: 'Bias checks', details: null }]);
    const res = await request(app).get('/api/governance/pillars');
    expect(res.body.fairness).toEqual({ score: 93, description: 'Bias checks', details: [] });
  });
});

describe('parseList', () => {
  it('handles json, csv, null', () => {
    expect(parseList('["email","phone"]')).toEqual(['email', 'phone']);
    expect(parseList('email, phone')).toEqual(['email', 'phone']);
    expect(parseList(null)).toEqual([]);
    expect(parseList('[]')).toEqual([]);
  });
});
