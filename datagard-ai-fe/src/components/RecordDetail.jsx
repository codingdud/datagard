import { useEffect, useState } from 'react'
import { Check, CheckCircle2, MoreHorizontal, X, XCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { initials, statusTone } from '../utils/format'
import { validate } from '../utils/records'
import AIRecommendation from './AIRecommendation'

const Indicator = ({ field, value }) => {
  const v = validate(field, value)
  if (!v) return null
  const Icon = v.state === 'ok' ? Check : v.state === 'warn' ? AlertTriangle : XCircle
  const cls = v.state === 'ok' ? 'ok' : v.state === 'warn' ? 'warn' : 'bad'
  return <span className={`ind ${cls}`}><Icon size={13} />{v.label}</span>
}

export default function RecordDetail({ record, resolution, onResolve, onUndo }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const ai = record.ai
  const value = resolution?.value ?? ai?.suggested

  useEffect(() => { setEditing(false) }, [record.id])

  const startEdit = () => { setDraft(value); setEditing(true) }
  const saveEdit = () => {
    const v = draft.trim()
    if (!v) return
    setEditing(false)
    onResolve('approved', v, true)
  }

  return (
    <aside className="card detail" aria-label="Selected record">
      <div>
        <div className="detail-top">
          <span className="eyebrow">Selected record</span>
          <span className={`tag ${statusTone(record.status)}`}>{record.status}</span>
        </div>
        <h2 className="rec-title">{record.id}</h2>
      </div>

      <div className="person">
        <div className="avatar">{initials(record.name)}</div>
        <div style={{ flex: 1 }}>
          <div className="strong" style={{ fontSize: 15 }}>{record.name}</div>
          <div className="rec-sub">{record.department || 'No department'} · Customer profile</div>
        </div>
        <button className="icon-btn bordered" aria-label="More actions"><MoreHorizontal size={16} /></button>
      </div>

      <div>
        {[['Email', 'email'], ['Phone', 'phone'], ['Department', 'department']].map(([label, key]) => (
          <div className="field-row" key={key}>
            <span className="k">{label}</span>
            <span className="strong">{record[key] || '—'}</span>
            <Indicator field={key} value={record[key]} />
          </div>
        ))}
      </div>

      {resolution?.state === 'approved' && (
        <div className="result success" role="status"><CheckCircle2 size={17} />✓ Correction approved{resolution.edited && ' (edited)'}: {resolution.value}
          <button onClick={onUndo}>Undo</button></div>
      )}
      {resolution?.state === 'rejected' && (
        <div className="result danger" role="status"><XCircle size={17} />✕ Correction rejected
          <button onClick={onUndo}>Undo</button></div>
      )}

      {ai ? (
        <>
          <AIRecommendation
            ai={ai} value={value} editing={editing} draft={draft}
            onDraft={setDraft} onSaveEdit={saveEdit} onCancelEdit={() => setEditing(false)}
          />
          {!resolution && (
            <div className="actions">
              {editing ? (
                <>
                  <button className="btn primary" onClick={saveEdit}><Check size={16} />Save &amp; approve</button>
                  <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="btn primary" onClick={() => onResolve('approved', ai.suggested)}><Check size={16} />Approve</button>
                  <button className="btn" onClick={() => onResolve('rejected', ai.suggested)}><X size={16} />Reject</button>
                  <button className="btn" onClick={startEdit}>Edit</button>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="state" style={{ padding: '28px 12px', border: '1px dashed var(--border)', borderRadius: 12 }}>
          <div className="ico"><Sparkles size={20} /></div>
          <h3>No AI recommendation</h3>
          <p>This record passed all validation rules.</p>
        </div>
      )}
    </aside>
  )
}
