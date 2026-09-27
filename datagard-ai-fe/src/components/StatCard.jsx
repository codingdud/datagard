import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { ICONS } from '../utils/icons'
import { fmt } from '../utils/format'

export default function StatCard({ kpi }) {
  const Icon = ICONS[kpi.icon]
  const hasTrend = kpi.trend !== null && kpi.trend !== undefined
  // For quarantined records, a decrease is the good direction.
  const good = kpi.key === 'quarantined' ? kpi.trend < 0 : kpi.trend > 0
  const Arrow = kpi.trend >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <div className="card kpi">
      <div className="kpi-top">
        <div className={`kpi-icon ${kpi.tone === 'accent' ? '' : kpi.tone}`}><Icon size={18} /></div>
      </div>
      <div className="kpi-label-row">
        <span>{kpi.label}</span>
        {hasTrend && (
          <span className={`trend ${good ? 'good' : 'bad'}`}>
            <Arrow size={12} />{kpi.trend > 0 ? '+' : ''}{kpi.trend}%
          </span>
        )}
      </div>
      <div className="kpi-value">{fmt(kpi.value)}{kpi.suffix}</div>
      <div className="kpi-note">{kpi.note}</div>
    </div>
  )
}
