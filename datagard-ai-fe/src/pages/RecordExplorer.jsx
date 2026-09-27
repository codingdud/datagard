import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Database, ArrowUpRight } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'
import { getRecords, submitRecordDecision } from '../services/api'
import { applyResolution } from '../utils/records'
import RecordList from '../components/RecordList'
import RecordDetail from '../components/RecordDetail'
import { ErrorState, Skeleton } from '../components/States'

const EMPTY = { q: '', status: '', issue: '', confidence: '', department: '' }
const bucket = (c) => (c >= 95 ? 'high' : c >= 80 ? 'mid' : 'low')

export default function RecordExplorer() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const { data, loading, error, reload } = useAsync(getRecords, [])
  const [filters, setFilters] = useState({ ...EMPTY, issue: params.get('issue') || '' })
  const [selectedId, setSelectedId] = useState(params.get('record') || 'C1024')
  const [resolved, setResolved] = useState({}) // id -> { state, value, edited }

  // Re-apply the issue filter when arriving from a dashboard link.
  useEffect(() => {
    setFilters((f) => ({ ...f, issue: params.get('issue') || '' }))
    if (params.get('record')) setSelectedId(params.get('record'))
  }, [params])

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  const records = useMemo(() => (data || []).map((r) => applyResolution(r, resolved[r.id])), [data, resolved])
  const departments = useMemo(() => [...new Set((data || []).map((r) => r.department).filter(Boolean))].sort(), [data])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    return records.filter((r) =>
      (!q || [r.id, r.name, r.email, r.department].some((v) => v.toLowerCase().includes(q))) &&
      (!filters.status || r.status === filters.status) &&
      (!filters.issue || r.issues.includes(filters.issue)) &&
      (!filters.confidence || bucket(r.confidence) === filters.confidence) &&
      (!filters.department || r.department === filters.department))
  }, [records, filters])

  if (error) return <ErrorState error={error} onRetry={reload} />
  if (loading || !data) {
    return <div className="explorer"><Skeleton h={560} style={{ borderRadius: 14 }} /><Skeleton h={560} style={{ borderRadius: 14 }} /></div>
  }

  const selected = records.find((r) => r.id === selectedId) || filtered[0] || records[0]

  const resolve = async (state, value, edited = false) => {
    setResolved((m) => ({ ...m, [selected.id]: { state, value, edited } }))
    try {
      await submitRecordDecision(selected.id, { state, value })
      toast(state === 'approved' ? `✓ Correction approved for ${selected.id}` : `✕ Correction rejected for ${selected.id}`, state === 'approved' ? 'success' : 'error')
    } catch {
      toast('Could not save decision', 'error')
    }
  }
  const undo = () => setResolved(({ [selected.id]: _, ...rest }) => rest)

  return (
    <>
      <div className="page-bar">
        <div>
          <div className="eyebrow"><Database size={15} />Record inventory</div>
          <div className="eyebrow-sub">{filtered.length} of {records.length} records{filters.issue && ` · issue: ${filters.issue}`}</div>
        </div>
        <button className="link-btn" onClick={() => navigate('/dashboard')}>Back to overview <ArrowUpRight size={14} /></button>
      </div>
      <div className="explorer">
        <RecordList
          records={filtered} selectedId={selected?.id} onSelect={setSelectedId}
          filters={filters} setFilter={setFilter} departments={departments} onClear={() => setFilters(EMPTY)}
        />
        {selected && (
          <RecordDetail key={selected.id} record={selected} resolution={resolved[selected.id]} onResolve={resolve} onUndo={undo} />
        )}
      </div>
    </>
  )
}
