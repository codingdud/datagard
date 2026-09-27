const repo = require('../repositories/fabric.repository');
const { tables: T } = require('../config');
const HttpError = require('../utils/httpError');
const { parsePaging, oneOf } = require('../utils/helpers');

// UI-facing status -> ledger decision_type values
const STATUS_MAP = {
  APPROVED: ['HUMAN_APPROVED', 'AUTO_APPROVED'],
  REJECTED: ['HUMAN_REJECTED', 'AUTO_REJECTED'],
  EDITED: ['HUMAN_EDITED'],
  REVIEW: ['NEEDS_REVIEW'],
};

const toDecision = (r) => ({
  decisionId: r.decision_id,
  recordId: r.record_id,
  field: r.field_name,
  originalValue: r.original_value,
  suggestedValue: r.suggested_value,
  action: r.action,
  confidence: r.confidence,
  rule: r.rule,
  model: r.model,
  decision: r.decision_type,
  reviewerId: r.reviewer_id,
  reason: r.reason,
  timestamp: r.timestamp,
});

async function listDecisions(q) {
  const { page, pageSize, offset } = parsePaging(q);
  const status = oneOf(q.status, Object.keys(STATUS_MAP), 'status');
  const action = oneOf(q.action, ['CORRECTED', 'NORMALIZED', 'REJECTED', 'REVIEW'], 'action');
  const min = q.confidenceMin != null ? Number(q.confidenceMin) : null;
  if (min !== null && (Number.isNaN(min) || min < 0 || min > 1)) {
    throw new HttpError(400, 'confidenceMin must be between 0 and 1');
  }

  const where = ['1 = 1'];
  const params = {};
  if (q.recordId) { where.push('record_id = @recordId'); params.recordId = String(q.recordId); }
  if (action) { where.push('UPPER(action) = @action'); params.action = action; }
  if (min !== null) { where.push('confidence >= @min'); params.min = min; }
  if (status) {
    const keys = STATUS_MAP[status].map((v, i) => { params[`s${i}`] = v; return `@s${i}`; });
    where.push(`decision_type IN (${keys.join(', ')})`);
  }
  const clause = where.join(' AND ');

  const [rows, count] = await Promise.all([
    repo.query(
      `SELECT * FROM ${T.ledger} WHERE ${clause} ORDER BY [timestamp] DESC OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
      { ...params, offset, pageSize },
    ),
    repo.query(`SELECT COUNT(*) AS total FROM ${T.ledger} WHERE ${clause}`, params),
  ]);
  return { data: rows.map(toDecision), pagination: { page, pageSize, total: Number(count[0]?.total) || 0 } };
}

async function getDecision(id) {
  const rows = await repo.query(`SELECT TOP 1 * FROM ${T.ledger} WHERE decision_id = @id`, { id });
  if (!rows.length) throw new HttpError(404, `Decision ${id} not found`);
  return toDecision(rows[0]);
}

module.exports = { listDecisions, getDecision };
