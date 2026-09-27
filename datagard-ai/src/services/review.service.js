const repo = require('../repositories/fabric.repository');
const { tables: T } = require('../config');
const HttpError = require('../utils/httpError');
const { parsePaging, oneOf, newId } = require('../utils/helpers');

// Only these columns may be corrected; they map 1:1 onto approved_records columns.
const EDITABLE = ['name', 'email', 'phone', 'department', 'country'];
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'EDITED'];
const ISSUE_PREDICATES = {
  INVALID: "q.invalid_fields IS NOT NULL AND q.invalid_fields NOT IN ('', '[]')",
  MISSING: "q.missing_fields IS NOT NULL AND q.missing_fields NOT IN ('', '[]')",
  DUPLICATE: 'q.duplicate_flag = 1',
  INCONSISTENT: 'q.inconsistency_flag = 1',
  AI_ANOMALY: 'q.ai_anomaly_flag = 1',
};

const toReview = (r) => ({
  reviewId: r.review_id,
  recordId: r.record_id,
  recommendationId: r.recommendation_id,
  field: r.field_name,
  originalValue: r.original_value,
  suggestedValue: r.suggested_value,
  confidence: r.confidence,
  reason: r.reason,
  status: r.status,
  reviewerId: r.reviewer_id,
  reviewerComment: r.reviewer_comment,
  createdAt: r.created_at,
  reviewedAt: r.reviewed_at,
});

async function listReviews(q) {
  const { page, pageSize, offset } = parsePaging(q);
  const status = oneOf(q.status ?? 'PENDING', STATUSES, 'status');
  const issueType = oneOf(q.issueType, Object.keys(ISSUE_PREDICATES), 'issueType');

  const where = ['1 = 1'];
  const params = {};
  if (status) { where.push('r.status = @status'); params.status = status; }
  if (issueType) where.push(ISSUE_PREDICATES[issueType]);
  if (q.search) {
    where.push('(r.record_id LIKE @search OR r.field_name LIKE @search OR r.suggested_value LIKE @search)');
    params.search = `%${String(q.search).slice(0, 100)}%`;
  }
  const from = `FROM ${T.reviewQueue} r LEFT JOIN ${T.quality} q ON q.record_id = r.record_id WHERE ${where.join(' AND ')}`;

  const [rows, count] = await Promise.all([
    repo.query(
      `SELECT r.* ${from} ORDER BY r.created_at DESC OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`,
      { ...params, offset, pageSize },
    ),
    repo.query(`SELECT COUNT(*) AS total ${from}`, params),
  ]);
  return { data: rows.map(toReview), pagination: { page, pageSize, total: Number(count[0]?.total) || 0 } };
}

const KINDS = {
  approve: { queue: 'APPROVED', action: 'CORRECTED', type: 'HUMAN_APPROVED' },
  reject: { queue: 'REJECTED', action: 'REJECTED', type: 'HUMAN_REJECTED' },
  edit: { queue: 'EDITED', action: 'CORRECTED', type: 'HUMAN_EDITED' },
};

/**
 * Human decision on a pending review. raw_records is never modified:
 *   approve/edit -> new approved_records version + queue + recommendation update + ledger row
 *   reject       -> queue + recommendation update + ledger row
 * All writes happen in one transaction.
 */
async function decide(reviewId, kind, { reviewerId, comment, field, value } = {}) {
  const k = KINDS[kind];
  if (!reviewerId || typeof reviewerId !== 'string') throw new HttpError(400, 'reviewerId is required');
  if (kind === 'edit' && (typeof value !== 'string' || !value.trim() || value.length > 500)) {
    throw new HttpError(400, 'value is required (1-500 characters) for an edit');
  }

  return repo.transaction(async (run) => {
    const found = await run(`SELECT TOP 1 * FROM ${T.reviewQueue} WHERE review_id = @reviewId`, { reviewId });
    if (!found.rows.length) throw new HttpError(404, `Review ${reviewId} not found`);
    const review = found.rows[0];
    if (review.status !== 'PENDING') throw new HttpError(409, `Review ${reviewId} is already ${review.status}`);

    const now = new Date();
    const targetField = kind === 'edit' ? field || review.field_name : review.field_name;
    const newValue = kind === 'edit' ? value.trim() : review.suggested_value;

    if (kind !== 'reject') {
      if (!EDITABLE.includes(targetField)) {
        throw new HttpError(422, `Field "${targetField}" cannot be corrected (allowed: ${EDITABLE.join(', ')})`);
      }
      // Base = latest approved version if there is one, otherwise the raw record (implicit v1).
      const approved = await run(
        `SELECT TOP 1 * FROM ${T.approved} WHERE record_id = @recordId ORDER BY version DESC`,
        { recordId: review.record_id },
      );
      let base;
      let version;
      if (approved.rows.length) {
        base = approved.rows[0];
        version = Number(base.version) + 1;
      } else {
        const raw = await run(`SELECT TOP 1 * FROM ${T.raw} WHERE record_id = @recordId`, { recordId: review.record_id });
        if (!raw.rows.length) throw new HttpError(404, `Record ${review.record_id} not found`);
        base = raw.rows[0];
        version = 2;
      }
      const next = {
        name: base.name, email: base.email, phone: base.phone, department: base.department, country: base.country,
        [targetField]: newValue,
      };
      await run(
        `INSERT INTO ${T.approved} (record_id, version, name, email, phone, department, country, source, approved_by, approved_at)
         VALUES (@recordId, @version, @name, @email, @phone, @department, @country, 'HUMAN_REVIEW', @by, @at)`,
        { recordId: review.record_id, version, ...next, by: reviewerId, at: now },
      );
    }

    const upd = await run(
      `UPDATE ${T.reviewQueue}
       SET status = @status, reviewer_id = @by, reviewer_comment = @comment, reviewed_at = @at
       WHERE review_id = @reviewId AND status = 'PENDING'`,
      { status: k.queue, by: reviewerId, comment: comment ?? null, at: now, reviewId },
    );
    if (upd.affected === 0) throw new HttpError(409, `Review ${reviewId} was already resolved`);

    if (review.recommendation_id) {
      await run(
        `UPDATE ${T.recommendations} SET recommendation_status = @status WHERE recommendation_id = @id`,
        { status: k.queue, id: review.recommendation_id },
      );
    }

    const reason = {
      approve: 'Human reviewer approved AI recommendation',
      reject: 'Human reviewer rejected AI recommendation',
      edit: `Human reviewer edited value to "${newValue}"`,
    }[kind] + (comment ? `: ${comment}` : '');

    const decisionId = newId('DEC');
    await run(
      `INSERT INTO ${T.ledger}
         (decision_id, record_id, field_name, original_value, suggested_value, action, confidence, rule, model, decision_type, reviewer_id, reason, [timestamp])
       SELECT @decisionId, @recordId, @field, @original, @suggested, @action, @confidence,
              rec.rule, COALESCE(rec.model, 'Fabric AI'), @type, @by, @reason, @at
       FROM (SELECT 1 AS x) d
       LEFT JOIN ${T.recommendations} rec ON rec.recommendation_id = @recId`,
      {
        decisionId, recordId: review.record_id, field: targetField,
        original: review.original_value, suggested: review.suggested_value,
        action: k.action, confidence: review.confidence, type: k.type, by: reviewerId,
        reason, at: now, recId: review.recommendation_id,
      },
    );

    return {
      success: true,
      reviewId,
      decisionId,
      recordId: review.record_id,
      status: k.queue,
      ...(kind !== 'reject' && { updatedField: targetField, oldValue: review.original_value, newValue }),
    };
  });
}

module.exports = {
  listReviews,
  approveReview: (id, body) => decide(id, 'approve', body),
  rejectReview: (id, body) => decide(id, 'reject', body),
  editReview: (id, body) => decide(id, 'edit', body),
};
