import { Sparkles } from 'lucide-react'

export default function AIRecommendation({ ai, value, editing, draft, onDraft, onSaveEdit, onCancelEdit }) {
  return (
    <div className="ai-card" aria-label="AI recommendation">
      <div className="ai-head">
        <div className="side-icon"><Sparkles size={17} /></div>
        <div>
          <div className="side-title">✨ AI Recommendation</div>
          <div className="side-sub">Fabric AI · explanation ready</div>
        </div>
        <span className="ai-match">{ai.confidence}% match</span>
      </div>

      <div className="ai-suggest">
        <span className="muted" style={{ fontSize: 12.5 }}>Suggested value <span style={{ opacity: .7 }}>({ai.field})</span></span>
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); onSaveEdit() }} style={{ display: 'flex', gap: 8 }}>
            <input
              className="edit-input" autoFocus aria-label="Edit suggested value" value={draft}
              onChange={(e) => onDraft(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && onCancelEdit()}
            />
          </form>
        ) : <span className="ai-value grad">{value}</span>}
      </div>

      <p className="ai-reason"><b>Reason: </b>{ai.reason}</p>
      <div className="ai-meta">
        <span>Rule<b>{ai.rule}</b></span>
        <span>Model<b>Fabric AI</b></span>
        <span>Threshold<b>{ai.threshold}%</b></span>
      </div>
    </div>
  )
}
