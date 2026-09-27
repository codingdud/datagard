const repo = require('../repositories/fabric.repository');
const { tables: T } = require('../config');
const HttpError = require('../utils/httpError');
const { parseList, round1 } = require('../utils/helpers');

const nonEmptyList = (col) => `CASE WHEN ${col} IS NOT NULL AND ${col} NOT IN ('', '[]') THEN 1 ELSE 0 END`;

async function getDashboardMetrics() {
  const [totals, summary, trend] = await Promise.all([
    repo.query(`SELECT COUNT(*) AS total FROM ${T.raw}`),
    repo.query(`
      SELECT AVG(CAST(quality_score AS FLOAT)) AS avg_score,
        SUM(CASE WHEN quality_status = 'TRUSTED' THEN 1 ELSE 0 END) AS trusted,
        SUM(CASE WHEN quality_status = 'REVIEW' THEN 1 ELSE 0 END) AS review,
        SUM(CASE WHEN quality_status IN ('QUARANTINE', 'QUARANTINED') THEN 1 ELSE 0 END) AS quarantined,
        SUM(${nonEmptyList('missing_fields')}) AS missing,
        SUM(${nonEmptyList('invalid_fields')}) AS invalid,
        SUM(CASE WHEN duplicate_flag = 1 THEN 1 ELSE 0 END) AS duplicate,
        SUM(CASE WHEN inconsistency_flag = 1 THEN 1 ELSE 0 END) AS inconsistent,
        SUM(CASE WHEN ai_anomaly_flag = 1 THEN 1 ELSE 0 END) AS ai_anomalies
      FROM ${T.quality}`),
    repo.query(`
      SELECT TOP 7 CAST(processed_at AS DATE) AS day, AVG(CAST(quality_score AS FLOAT)) AS score
      FROM ${T.quality} WHERE processed_at IS NOT NULL
      GROUP BY CAST(processed_at AS DATE) ORDER BY CAST(processed_at AS DATE) DESC`),
  ]);
  const s = summary[0] || {};
  const n = (v) => Number(v) || 0;
  return {
    totalRecords: n(totals[0]?.total),
    qualityScore: round1(s.avg_score),
    trusted: n(s.trusted),
    quarantined: n(s.quarantined),
    review: n(s.review),
    issues: {
      missing: n(s.missing),
      invalid: n(s.invalid),
      duplicate: n(s.duplicate),
      inconsistent: n(s.inconsistent),
      aiAnomalies: n(s.ai_anomalies),
    },
    trend: [...trend].reverse().map((r) => ({ date: new Date(r.day).toISOString().slice(0, 10), score: round1(r.score) })),
  };
}

async function getRecord(recordId) {
  const [raw, quality, recs, reviews, approved] = await Promise.all([
    repo.query(`SELECT TOP 1 * FROM ${T.raw} WHERE record_id = @id`, { id: recordId }),
    repo.query(`SELECT TOP 1 * FROM ${T.quality} WHERE record_id = @id ORDER BY processed_at DESC`, { id: recordId }),
    repo.query(`SELECT * FROM ${T.recommendations} WHERE record_id = @id ORDER BY created_at DESC`, { id: recordId }),
    repo.query(`SELECT * FROM ${T.reviewQueue} WHERE record_id = @id ORDER BY created_at DESC`, { id: recordId }),
    repo.query(`SELECT TOP 1 * FROM ${T.approved} WHERE record_id = @id ORDER BY version DESC`, { id: recordId }),
  ]);
  if (!raw.length) throw new HttpError(404, `Record ${recordId} not found`);

  // eslint-disable-next-line no-unused-vars
  const { record_id: _id, ...fields } = raw[0];
  const q = quality[0];
  const issues = [];
  if (q) {
    parseList(q.invalid_fields).forEach((field) => issues.push({ field, type: 'INVALID' }));
    parseList(q.missing_fields).forEach((field) => issues.push({ field, type: 'MISSING' }));
    if (q.duplicate_flag) issues.push({ field: null, type: 'DUPLICATE' });
    if (q.inconsistency_flag) issues.push({ field: null, type: 'INCONSISTENT' });
    if (q.ai_anomaly_flag) issues.push({ field: null, type: 'AI_ANOMALY' });
  }
  const a = approved[0];
  return {
    recordId,
    record: fields,
    approvedVersion: a ? { version: a.version, approvedBy: a.approved_by, approvedAt: a.approved_at } : null,
    quality: q ? { score: q.quality_score, status: q.quality_status, issueCount: q.issue_count, processedAt: q.processed_at } : null,
    issues,
    recommendations: recs.map((r) => ({
      recommendationId: r.recommendation_id,
      field: r.field_name,
      original: r.original_value,
      suggested: r.suggested_value,
      confidence: r.confidence,
      rule: r.rule,
      reason: r.reason,
      model: r.model,
      status: r.recommendation_status,
    })),
    reviews: reviews.map((r) => ({ reviewId: r.review_id, field: r.field_name, status: r.status, reviewedAt: r.reviewed_at })),
  };
}

// Pillars are read from governance_metrics: pillar, score, description[, details]
async function getPillars() {
  const rows = await repo.query(`SELECT pillar, score, description, details FROM ${T.governance}`);
  return Object.fromEntries(
    rows.map((r) => [
      String(r.pillar).toLowerCase(),
      { score: Number(r.score), description: r.description, details: parseList(r.details) },
    ]),
  );
}

async function getHealth() {
  await repo.ping();
  return { status: 'ok', fabric: 'connected', timestamp: new Date().toISOString() };
}

module.exports = { getDashboardMetrics, getRecord, getPillars, getHealth };
