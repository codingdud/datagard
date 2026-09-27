import { ChevronRight } from 'lucide-react'
import { ICONS } from '../utils/icons'

export default function PillarCard({ pillar, open, onToggle }) {
  const Icon = ICONS[pillar.icon]
  return (
    <button className={`card pillar${open ? ' open' : ''}`} aria-expanded={open} onClick={onToggle}>
      <div className="pillar-top">
        <div className="kpi-icon"><Icon size={18} /></div>
        <div className="pillar-score">{pillar.score}%</div>
      </div>
      <div className="pillar-name">{pillar.name}</div>
      <div className="pillar-short">{pillar.short}</div>
      <div className="track" role="progressbar" aria-valuenow={pillar.score} aria-valuemin={0} aria-valuemax={100}>
        <div className="fill" style={{ width: `${pillar.score}%` }} />
      </div>
      {open && (
        <div className="pillar-more">
          {pillar.detail}
          <ul>{pillar.extra.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <div className="pillar-chev"><ChevronRight size={15} /></div>
    </button>
  )
}
