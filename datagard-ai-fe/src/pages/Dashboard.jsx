import { ChevronRight } from 'lucide-react'
import useAsync from '../hooks/useAsync'
import { getDashboardMetrics } from '../services/api'
import StatCard from '../components/StatCard'
import QualityTrend from '../components/QualityTrend'
import RecordStatus from '../components/RecordStatus'
import IssueBreakdown from '../components/IssueBreakdown'
import Pipeline from '../components/Pipeline'
import { ErrorState, Skeleton } from '../components/States'

function DashboardSkeleton() {
  return (
    <>
      <div className="grid-kpi">{[...Array(5)].map((_, i) => <Skeleton key={i} h={150} style={{ borderRadius: 14 }} />)}</div>
      <div className="grid-2"><Skeleton h={380} style={{ borderRadius: 14 }} /><Skeleton h={380} style={{ borderRadius: 14 }} /></div>
      <Skeleton h={300} style={{ borderRadius: 14 }} />
      <Skeleton h={200} style={{ borderRadius: 14 }} />
    </>
  )
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(getDashboardMetrics, [])
  if (error) return <ErrorState error={error} onRetry={reload} />
  if (loading || !data) return <DashboardSkeleton />

  return (
    <>
      <div className="page-bar">
        <div className="eyebrow"><span className="dot" style={{ background: '#818cf8', boxShadow: 'none' }} />Live overview</div>
        <div className="muted" style={{ fontSize: 12.5, display: 'flex', gap: 10, alignItems: 'center' }}>
          Last scan <b style={{ color: '#f5f7fa' }}>{data.lastScan}</b>
          <button className="link-btn" style={{ marginLeft: 8 }}>Scan details <ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid-kpi">{data.kpis.map((k) => <StatCard key={k.key} kpi={k} />)}</div>
      <div className="grid-2">
        <QualityTrend data={data.trend} target={data.target} />
        <RecordStatus data={data.status} />
      </div>
      <IssueBreakdown issues={data.issues} />
      <Pipeline steps={data.pipeline} />
    </>
  )
}
