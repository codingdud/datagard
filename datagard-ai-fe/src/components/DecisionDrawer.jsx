import { useEffect } from 'react'
import { ArrowRight, ExternalLink, Info, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAsync from '../hooks/useAsync'
import { getDecisionById } from '../services/api'
import { statusTone } from '../utils/format'
import { ErrorState, Skeleton } from './States'

export default function DecisionDrawer({ id, onClose }) {
  const navigate = useNavigate()
  const { data: d, loading, error, reload } = useAsync(() => getDecisionById(id), [id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="AI Decision">
        <div className="drawer-head">
          <div>
            <div className="eyebrow">AI Decision</div>
            <h2 className="rec-title" style={{ marginTop: 8 }}>{id}</h2>
          </div>
          <button className="icon-btn bordered" aria-label="Close" autoFocus onClick={onClose}><X size={16} /></button>
        </div>

        {error ? <ErrorState error={error} onRetry={reload} /> : loading || !d ? (
          <div style={{ display: 'grid', gap: 14 }}>
            <Skeleton h={60} /><Skeleton h={90} /><Skeleton h={120} />
          </div>
        ) : (
          <>
            <div className="kv">
              <div><div className="k">Record</div><div className="v">{d.record}</div></div>
              <div><div className="k">Field</div><div className="v mono">{d.field}</div></div>
              <div><div className="k">Rule</div><div className="v mono">{d.rule}</div></div>
              <div><div className="k">Model</div><div className="v">{d.model}</div></div>
              <div><div className="k">Confidence</div><div className="v">{d.confidence}%</div></div>
              <div><div className="k">Decision</div><div className="v mono">{d.decision}</div></div>
              <div><div className="k">Status</div><span className={`tag ${statusTone(d.status)}`}>{d.status}</span></div>
              <div><div className="k">Timestamp</div><div className="v mono" style={{ fontSize: 12.5 }}>{d.timestamp}</div></div>
            </div>

            <div className="diff">
              <div className="old"><div className="k">Original</div><div className="strong">{d.original}</div></div>
              <ArrowRight size={16} className="muted" />
              <div className="new"><div className="k">Suggested</div><div className="strong">{d.suggested}</div></div>
            </div>

            <div className="why">
              <h3><Info size={15} color="#a5b4ff" />Why was this decision made?</h3>
              <p>“{d.explanation}”</p>
            </div>

            <button className="btn" style={{ marginTop: 20 }} onClick={() => navigate(`/records?record=${d.record}`)}>
              <ExternalLink size={15} />Open record {d.record}
            </button>
          </>
        )}
      </aside>
    </>
  )
}
