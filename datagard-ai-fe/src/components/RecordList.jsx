import { ChevronRight, Search } from 'lucide-react'
import { statusTone } from '../utils/format'
import { ISSUE_LABELS, issueText } from '../utils/records'
import { EmptyState } from './States'

export default function RecordList({ records, selectedId, onSelect, filters, setFilter, departments, onClear }) {
  return (
    <section className="card" aria-label="Record list">
      <div className="toolbar">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Search records" placeholder="Search record ID, email, department..."
            value={filters.q} onChange={(e) => setFilter('q', e.target.value)}
          />
        </label>
      </div>
      <div className="filter-panel">
        <select className="select" aria-label="Status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option>Trusted</option><option>Review</option><option>Quarantine</option>
        </select>
        <select className="select" aria-label="Issue type" value={filters.issue} onChange={(e) => setFilter('issue', e.target.value)}>
          <option value="">All issues</option>
          {Object.entries(ISSUE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="select" aria-label="Confidence" value={filters.confidence} onChange={(e) => setFilter('confidence', e.target.value)}>
          <option value="">Any confidence</option>
          <option value="high">≥ 95%</option><option value="mid">80–94%</option><option value="low">&lt; 80%</option>
        </select>
        <select className="select" aria-label="Department" value={filters.department} onChange={(e) => setFilter('department', e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="list-head" aria-hidden="true"><span>RECORD</span><span>STATUS</span><span>CONFIDENCE</span><span /></div>
      {records.length === 0 ? (
        <EmptyState title="No matching records" text="No records match the current search and filters."
          action={<button className="btn" onClick={onClear}>Clear filters</button>} />
      ) : records.map((r) => (
        <button key={r.id} className={`rec-row${r.id === selectedId ? ' selected' : ''}`} aria-pressed={r.id === selectedId} onClick={() => onSelect(r.id)}>
          <div><div className="rec-id">{r.id}</div><div className="rec-sub">{r.name}</div></div>
          <div><span className={`tag ${statusTone(r.status)}`}>{r.status}</span><div className="rec-sub">{issueText(r.issues.length)}</div></div>
          <div className="conf">
            <b>{r.confidence}%</b>
            <span className="bar"><i className={r.confidence >= 90 ? '' : r.confidence >= 80 ? 'mid' : 'low'} style={{ width: `${r.confidence}%` }} /></span>
          </div>
          <ChevronRight size={16} className="muted" />
        </button>
      ))}
    </section>
  )
}
