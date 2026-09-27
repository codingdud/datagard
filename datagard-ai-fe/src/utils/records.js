export const CANONICAL_DEPTS = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'HR']

export const ISSUE_LABELS = {
  missing: 'Missing', invalid: 'Invalid', duplicate: 'Duplicate', inconsistent: 'Inconsistent', anomaly: 'AI anomalies',
}

const FIELD_ISSUES = { email: ['invalid'], phone: ['invalid'], department: ['inconsistent', 'missing'] }

// -> { state: 'ok' | 'bad' | 'warn', label }
export function validate(field, value) {
  if (field === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? { state: 'ok', label: 'Valid' } : { state: 'bad', label: 'Invalid email' }
  }
  if (field === 'phone') {
    return /^\+\d{1,3}\s?\d{7,12}$/.test(value) ? { state: 'ok', label: 'Valid' } : { state: 'bad', label: 'Invalid phone' }
  }
  if (field === 'department') {
    if (!value) return { state: 'bad', label: 'Missing value' }
    return CANONICAL_DEPTS.includes(value) ? { state: 'ok', label: 'Valid' } : { state: 'warn', label: 'Needs correction' }
  }
  return null
}

// Overlay a reviewer resolution ({ state, value }) on a record from the API.
export function applyResolution(rec, res) {
  if (!res || res.state !== 'approved' || !rec.ai) return rec
  const issues = [...rec.issues]
  const hit = (FIELD_ISSUES[rec.ai.field] || []).find((i) => issues.includes(i))
  if (hit) issues.splice(issues.indexOf(hit), 1)
  return { ...rec, [rec.ai.field]: res.value, issues, status: issues.length ? rec.status : 'Trusted' }
}

export const issueText = (n) => (n === 0 ? 'No issues' : `${n} issue${n > 1 ? 's' : ''}`)
