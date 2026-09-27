import { useMemo, useState } from 'react'
import { FileCheck2, Search, SlidersHorizontal } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { getDecisionLedger } from '../services/api'
import DecisionTable from '../components/DecisionTable'
import DecisionDrawer from '../components/DecisionDrawer'
import { EmptyState, ErrorState, Skeleton } from '../components/States'

const EMPTY = { q: '', status: '', action: '', confidence: '', date: '' }
const bucket = (c) => (c >= 95 ? 'high' : c >= 80 ? 'mid' : 'low')

export default function DecisionLedger() {
  const { data, loading, error, reload } = useAsync(getDecisionLedger, [])
  const [f, setF] = useState(EMPTY)
  const [showFilters, setShowFilters] = useState(false)
  const [openId, setOpenId] = useState(null)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const actions = useMemo(() => [...new Set((data || []).map((d) => d.action))], [data])
  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return (data || []).filter((d) =>
      (!q || [d.id, d.record, d.field, d.action].some((v) => v.toLowerCase().includes(q))) &&
      (!f.status || d.status === f.status) &&
      (!f.action || d.action === f.action) &&
      (!f.confidence || bucket(d.confidence) === f.confidence) &&
      (!f.date || d.timestamp.startsWith(f.date)))
  }, [data, f])

  if (error) return <ErrorState error={error} onRetry={reload} />
  const activeAdvanced = [f.action, f.confidence, f.date].filter(Boolean).length

  return (
    <>
      <div className="page-bar">
        <div>
          <div className="eyebrow"><FileCheck2 size={15} />Immutable audit trail</div>
          <div className="eyebrow-sub">{data ? `${data.length} decisions logged today` : 'Loading…'}</div>
        </div>
        <span className="ok" style={{ fontSize: 12.5 }}><span className="dot" />Ledger healthy</span>
      </div>

      <section className="card" aria-label="Decision ledger">
        <div className="toolbar">
          <label className="search">
            <Search size={16} />
            <input aria-label="Search decisions" placeholder="Search record, field, or action…" value={f.q} onChange={(e) => set('q', e.target.value)} />
          </label>
          <select className="select" aria-label="Status" value={f.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">All statuses</option><option>Approved</option><option>Rejected</option><option>Review</option>
          </select>
          <button className="btn" aria-expanded={showFilters} onClick={() => setShowFilters((s) => !s)}>
            <SlidersHorizontal size={15} />Filters
            {activeAdvanced > 0 && <span className="badge-count">{activeAdvanced}</span>}
          </button>
        </div>
        {showFilters && (
          <div className="filter-panel">
            <label className="field-label">Action
              <select className="select" value={f.action} onChange={(e) => set('action', e.target.value)}>
                <option value="">All actions</option>{actions.map((a) => <option key={a}>{a}</option>)}
              </select>
            </label>
            <label className="field-label">Confidence
              <select className="select" value={f.confidence} onChange={(e) => set('confidence', e.target.value)}>
                <option value="">Any confidence</option><option value="high">≥ 95%</option><option value="mid">80–94%</option><option value="low">&lt; 80%</option>
              </select>
            </label>
            <label className="field-label">Date
              <input type="date" className="select" value={f.date} onChange={(e) => set('date', e.target.value)} />
            </label>
            <button className="link-btn" style={{ alignSelf: 'flex-end', height: 40 }} onClick={() => setF(EMPTY)}>Reset</button>
          </div>
        )}

        {loading || !data ? (
          <div style={{ padding: 20, display: 'grid', gap: 12 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} h={44} />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState title="No decisions found" text="No ledger entries match your filters."
            action={<button className="btn" onClick={() => setF(EMPTY)}>Clear filters</button>} />
        ) : <DecisionTable rows={rows} selectedId={openId} onSelect={setOpenId} />}
      </section>

      {openId && <DecisionDrawer id={openId} onClose={() => setOpenId(null)} />}
    </>
  )
}
