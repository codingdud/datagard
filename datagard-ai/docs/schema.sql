-- Reference T-SQL for the tables the API reads/writes (Fabric Warehouse dialect: no NVARCHAR, no IDENTITY/defaults).
-- Adjust to match your existing tables; column names are what the API code expects.
-- NOTE: a Lakehouse SQL analytics endpoint is READ-ONLY. The three tables the API WRITES to
-- (human_review_queue, approved_records, ai_decision_ledger) plus ai_recommendations' status column
-- must live in a Fabric Warehouse (or be writable another way).

-- raw_records: never modified by the API (extra columns are fine and are returned by GET /api/records/:id)
-- record_id, name, email, phone, department, country, ...

CREATE TABLE quality_results (
  record_id VARCHAR(50) NOT NULL, quality_status VARCHAR(20), quality_score FLOAT, issue_count INT,
  missing_fields VARCHAR(1000),      -- JSON array or comma list
  invalid_fields VARCHAR(1000),
  duplicate_flag BIT, inconsistency_flag BIT, ai_anomaly_flag BIT,
  processed_at DATETIME2(6)
);

CREATE TABLE ai_recommendations (
  recommendation_id VARCHAR(50) NOT NULL, record_id VARCHAR(50) NOT NULL, field_name VARCHAR(50),
  original_value VARCHAR(500), suggested_value VARCHAR(500), confidence FLOAT,   -- 0..1
  rule VARCHAR(100), reason VARCHAR(1000), model VARCHAR(100),
  recommendation_status VARCHAR(20), created_at DATETIME2(6)
);

CREATE TABLE human_review_queue (
  review_id VARCHAR(50) NOT NULL, record_id VARCHAR(50) NOT NULL, recommendation_id VARCHAR(50),
  field_name VARCHAR(50), original_value VARCHAR(500), suggested_value VARCHAR(500), confidence FLOAT,
  reason VARCHAR(1000), status VARCHAR(20),          -- PENDING | APPROVED | REJECTED | EDITED
  reviewer_id VARCHAR(100), reviewer_comment VARCHAR(1000), created_at DATETIME2(6), reviewed_at DATETIME2(6)
);

CREATE TABLE approved_records (
  record_id VARCHAR(50) NOT NULL, version INT NOT NULL,
  name VARCHAR(200), email VARCHAR(200), phone VARCHAR(50), department VARCHAR(100), country VARCHAR(100),
  source VARCHAR(30), approved_by VARCHAR(100), approved_at DATETIME2(6)
);

CREATE TABLE ai_decision_ledger (
  decision_id VARCHAR(50) NOT NULL, record_id VARCHAR(50) NOT NULL, field_name VARCHAR(50),
  original_value VARCHAR(500), suggested_value VARCHAR(500), action VARCHAR(30), confidence FLOAT,
  rule VARCHAR(100), model VARCHAR(100),
  decision_type VARCHAR(30),   -- HUMAN_APPROVED | HUMAN_REJECTED | HUMAN_EDITED | AUTO_APPROVED | NEEDS_REVIEW
  reviewer_id VARCHAR(100), reason VARCHAR(1000), [timestamp] DATETIME2(6)
);

-- Six-pillar scores. Fairness/Privacy/Inclusivity cannot be derived from the tables above,
-- so your pipeline (or a notebook) should publish them here.
CREATE TABLE governance_metrics (
  pillar VARCHAR(30) NOT NULL,      -- FAIRNESS | RELIABILITY | PRIVACY | INCLUSIVITY | TRANSPARENCY | ACCOUNTABILITY
  score FLOAT, description VARCHAR(200), details VARCHAR(2000)   -- details: JSON array of strings
);
