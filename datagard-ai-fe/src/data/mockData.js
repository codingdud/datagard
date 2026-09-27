// Mock payloads. ONLY services/api.js may import from this folder.
export const dashboard = {
  lastScan: '2 min ago',
  kpis: [
    { key: 'total', label: 'Total records', value: 50000, trend: 2.4, note: 'vs previous scan', icon: 'database', tone: 'accent' },
    { key: 'score', label: 'Quality score', value: 84.2, suffix: '%', trend: 4.8, note: 'from previous scan', icon: 'sparkles', tone: 'success' },
    { key: 'trusted', label: 'Trusted', value: 31842, trend: 7.1, note: 'ready for use', icon: 'check', tone: 'accent' },
    { key: 'quarantined', label: 'Quarantined', value: 8507, trend: -1.8, note: 'needs intervention', icon: 'shield', tone: 'warning' },
    { key: 'review', label: 'Review queue', value: 9651, trend: null, note: 'awaiting human review', icon: 'alert', tone: 'warning' },
  ],
  trend: [
    { day: 'Mon', score: 72 }, { day: 'Tue', score: 75 }, { day: 'Wed', score: 77 },
    { day: 'Thu', score: 79 }, { day: 'Fri', score: 82 }, { day: 'Sat', score: 83 }, { day: 'Sun', score: 84.2 },
  ],
  target: 80,
  status: [
    { name: 'Trusted', value: 64, count: 31842, color: '#22C55E' },
    { name: 'Review', value: 17, count: 9651, color: '#F59E0B' },
    { name: 'Quarantine', value: 19, count: 8507, color: '#EF4444' },
  ],
  issues: [
    { key: 'missing', label: 'Missing', count: 8421, color: '#3B82F6' },
    { key: 'invalid', label: 'Invalid', count: 6321, color: '#EF4444' },
    { key: 'duplicate', label: 'Duplicate', count: 5102, color: '#A78BFA' },
    { key: 'inconsistent', label: 'Inconsistent', count: 4521, color: '#F59E0B' },
    { key: 'anomaly', label: 'AI anomalies', count: 3212, color: '#22C55E' },
  ],
  pipeline: [
    { step: '01', title: 'Data ingestion', sub: '50,000 records', icon: 'database' },
    { step: '02', title: 'Validation engine', sub: 'Rules + AI checks', icon: 'zap' },
    { step: '03', title: 'Human review', sub: 'Trusted · Review · Quarantine', icon: 'users' },
    { step: '04', title: 'Audit ledger', sub: 'Explainable decisions', icon: 'file' },
    { step: '05', title: 'Quality report', sub: 'Governance ready', icon: 'sparkles' },
  ],
}

export const records = [
  { id: 'C1021', name: 'Sarah Wilson', email: 'sarah.wilson@acme.com', phone: '+1 4155550132', department: 'Marketing', status: 'Trusted', issues: [], confidence: 99 },
  { id: 'C1022', name: 'Michael Chen', email: 'm.chen@acme', phone: '+1 4155550178', department: 'Sales', status: 'Review', issues: ['invalid'], confidence: 88,
    ai: { field: 'email', suggested: 'm.chen@acme.com', confidence: 88, reason: 'Domain completed from organisation domain "acme.com"', rule: 'EMAIL_DOMAIN_COMPLETE', threshold: 85 } },
  { id: 'C1023', name: 'Priya Patel', email: 'priya.patel@acme.com', phone: '+91 9812345678', department: 'Finance', status: 'Trusted', issues: [], confidence: 98 },
  { id: 'C1024', name: 'John Doe', email: 'john.doe@gmail', phone: '+91 9876543210', department: 'Enginering', status: 'Review', issues: ['invalid', 'inconsistent'], confidence: 97,
    ai: { field: 'department', suggested: 'Engineering', confidence: 97, reason: 'Semantic similarity to canonical department "Engineering"', rule: 'DEPT_SIMILARITY', threshold: 85 } },
  { id: 'C1025', name: 'Emma Rodriguez', email: 'emma.r@', phone: '+34 600123456', department: '', status: 'Quarantine', issues: ['invalid', 'missing', 'duplicate'], confidence: 76,
    ai: { field: 'department', suggested: 'Operations', confidence: 76, reason: 'Inferred from manager hierarchy and cost centre', rule: 'DEPT_INFERENCE', threshold: 85 } },
  { id: 'C1026', name: 'David Kim', email: 'david.kim@acme.com', phone: '+82 1012345678', department: 'Engineering', status: 'Trusted', issues: [], confidence: 96 },
]

export const decisions = [
  { id: 'D-48291', record: 'C1024', field: 'department', action: 'corrected', confidence: 97, model: 'Fabric AI', status: 'Approved', timestamp: '2026-09-26 18:42:31',
    original: 'Enginering', suggested: 'Engineering', rule: 'DEPT_SIMILARITY', decision: 'AUTO_APPROVED',
    explanation: 'Semantic similarity between the submitted department value and the canonical department value exceeded the configured confidence threshold.' },
  { id: 'D-48290', record: 'C1031', field: 'country', action: 'normalized', confidence: 99, model: 'Fabric AI', status: 'Approved', timestamp: '2026-09-26 18:39:12',
    original: 'U.S.A', suggested: 'United States', rule: 'COUNTRY_ISO_NORMALIZE', decision: 'AUTO_APPROVED',
    explanation: 'The value matched a known alias of an ISO 3166 country name and was normalised to the canonical form.' },
  { id: 'D-48289', record: 'C1102', field: 'email', action: 'rejected', confidence: 100, model: 'Fabric AI', status: 'Rejected', timestamp: '2026-09-26 18:36:08',
    original: 'user@@corp..com', suggested: '—', rule: 'EMAIL_SYNTAX', decision: 'REJECTED',
    explanation: 'The email failed RFC 5322 syntax validation and no safe correction could be derived, so the value was rejected.' },
  { id: 'D-48288', record: 'C1201', field: 'department', action: 'review', confidence: 81, model: 'Fabric AI', status: 'Review', timestamp: '2026-09-26 18:32:44',
    original: 'Eng & Ops', suggested: 'Engineering', rule: 'DEPT_SIMILARITY', decision: 'NEEDS_REVIEW',
    explanation: 'Similarity was below the auto-approve threshold of 85%, so the suggestion was routed to a human reviewer.' },
  { id: 'D-48287', record: 'C1044', field: 'phone', action: 'normalized', confidence: 96, model: 'Fabric AI', status: 'Approved', timestamp: '2026-09-26 18:28:03',
    original: '98765 43210', suggested: '+91 9876543210', rule: 'PHONE_E164', decision: 'AUTO_APPROVED',
    explanation: "The number was reformatted to E.164 using the record's country context. No digits were altered." },
]

export const pillars = {
  overall: 96.0, delta: 2.1, evaluated: '2 min ago',
  items: [
    { key: 'fairness', name: 'Fairness', score: 93, short: 'Bias checks', icon: 'branch',
      detail: 'Protected-group parity checks are passing across the current validation sample.',
      extra: ['Demographic parity gap: 1.8%', 'Groups evaluated: 12', 'Last bias audit: today'] },
    { key: 'reliability', name: 'Reliability', score: 96, short: 'Rule accuracy', icon: 'activity',
      detail: 'Validation rules agree with human reviewers on 96% of sampled decisions.',
      extra: ['Rules monitored: 148', 'Drift alerts: 0', 'Reviewer agreement: 96%'] },
    { key: 'privacy', name: 'Privacy', score: 98, short: 'PII controls', icon: 'lock',
      detail: 'PII fields are masked in logs and access is restricted by role.',
      extra: ['PII fields masked: 100%', 'Access reviews: current', 'Retention policy: enforced'] },
    { key: 'inclusivity', name: 'Inclusivity', score: 95, short: 'Coverage', icon: 'users',
      detail: 'Validation covers international name, phone and address formats.',
      extra: ['Locales covered: 42', 'Unicode names: supported', 'Format gaps: 3 open'] },
    { key: 'transparency', name: 'Transparency', score: 100, short: 'Explainability', icon: 'eye',
      detail: 'Every AI decision includes a rule, confidence and plain-language reason.',
      extra: ['Decisions explained: 100%', 'Reason codes: attached', 'Model cards: published'] },
    { key: 'accountability', name: 'Accountability', score: 100, short: 'Audit trail', icon: 'file',
      detail: 'All decisions and human overrides are written to the immutable ledger.',
      extra: ['Ledger entries: complete', 'Human overrides: logged', 'Tamper checks: passing'] },
  ],
}
