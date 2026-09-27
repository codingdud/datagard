import { useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { getSixPillarMetrics } from '../services/api'
import GovernanceWheel from '../components/GovernanceWheel'
import PillarCard from '../components/PillarCard'
import { ErrorState, Skeleton } from '../components/States'

export default function SixPillars() {
  const { data, loading, error, reload } = useAsync(getSixPillarMetrics, [])
  const [openKey, setOpenKey] = useState('fairness')

  if (error) return <ErrorState error={error} onRetry={reload} />
  if (loading || !data) {
    return (
      <>
        <Skeleton h={400} style={{ borderRadius: 14 }} />
        <div className="pillar-grid">{[...Array(6)].map((_, i) => <Skeleton key={i} h={150} style={{ borderRadius: 14 }} />)}</div>
      </>
    )
  }
  const toggle = (k) => setOpenKey((cur) => (cur === k ? null : k))

  return (
    <>
      <div className="page-bar">
        <div>
          <div className="eyebrow"><ShieldCheck size={15} />Governance monitor</div>
          <div className="eyebrow-sub">Last evaluated {data.evaluated}</div>
        </div>
        <div className="muted" style={{ fontSize: 12.5, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          Overall governance <b style={{ color: '#f5f7fa', fontSize: 20 }}>{data.overall.toFixed(1)}%</b>
          <span className="trend good">+{data.delta}%</span>
        </div>
      </div>

      <section className="card hero" aria-label="Six-pillar framework">
        <div>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Six-pillar framework</div>
          <h2>Trust is a<br /><em>measurable</em> system.</h2>
          <p>DataGuard continuously evaluates the principles behind every quality decision, so your team can move faster with confidence.</p>
          <div className="hero-tags">
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="dot" />6 pillars monitored</span>
            <span className="ok"><Check size={14} />Audit-ready</span>
          </div>
        </div>
        <GovernanceWheel items={data.items} overall={data.overall} activeKey={openKey} onSelect={setOpenKey} />
      </section>

      <div className="pillar-grid">
        {data.items.map((p) => <PillarCard key={p.key} pillar={p} open={openKey === p.key} onToggle={() => toggle(p.key)} />)}
      </div>
    </>
  )
}
