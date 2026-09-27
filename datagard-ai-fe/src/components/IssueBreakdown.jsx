import { ChevronRight, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fmt } from '../utils/format'

export default function IssueBreakdown({ issues }) {
  const navigate = useNavigate()
  const max = Math.max(...issues.map((i) => i.count))
  const total = issues.reduce((s, i) => s + i.count, 0)
  return (
    <section className="card card-pad" aria-label="Data quality issues">
      <div className="card-head">
        <div>
          <h2 className="card-title">Data quality issues</h2>
          <p className="card-sub">Top issue types detected in the latest scan</p>
        </div>
        <button className="link-btn" onClick={() => navigate('/records')}>View all issues <ArrowUpRight size={14} /></button>
      </div>
      <div>
        {issues.map((i) => (
          <button
            key={i.key} className="issue-row"
            aria-label={`${i.label}: ${fmt(i.count)} records. Open in Record Explorer`}
            onClick={() => navigate(`/records?issue=${i.key}`)}
          >
            <span className="issue-name"><span className="sq" style={{ background: i.color }} />{i.label}</span>
            <span className="track"><span className="fill" style={{ display: 'block', width: `${(i.count / max) * 100}%`, background: i.color }} /></span>
            <span className="num strong">{fmt(i.count)}</span>
            <span className="num muted pct">{Math.round((i.count / total) * 100)}%</span>
            <ChevronRight size={15} className="muted" />
          </button>
        ))}
      </div>
    </section>
  )
}
