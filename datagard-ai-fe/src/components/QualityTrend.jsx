import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CheckCircle2 } from 'lucide-react'

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#182031', border: '1px solid #202938', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
      <div className="muted">{label}</div>
      <div style={{ fontWeight: 600, marginTop: 2 }}>{payload[0].value}% quality</div>
    </div>
  )
}

export default function QualityTrend({ data, target }) {
  const latest = data[data.length - 1]?.score
  return (
    <section className="card card-pad" aria-label="Quality trend">
      <div className="card-head">
        <div>
          <h2 className="card-title">Quality trend</h2>
          <p className="card-sub">Seven-day quality score</p>
        </div>
        <span className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="dot" style={{ background: '#818cf8', boxShadow: 'none' }} />Quality score
        </span>
      </div>
      <div style={{ height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="qt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1a2232" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#8b95a7', fontSize: 12 }} />
            <YAxis domain={[65, 90]} ticks={[65, 72, 79, 86, 90]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fill: '#8b95a7', fontSize: 12 }} />
            <Tooltip content={<Tip />} cursor={{ stroke: '#334155', strokeDasharray: 4 }} />
            <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
            <Area type="monotone" dataKey="score" stroke="#8b8cf7" strokeWidth={2} fill="url(#qt)" activeDot={{ r: 5, fill: '#8b8cf7', stroke: '#111722', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="card-foot">
        <span>Target threshold <b style={{ color: '#f5f7fa' }}>{target}%</b></span>
        {latest >= target && <span className="ok"><CheckCircle2 size={13} />Above target</span>}
      </div>
    </section>
  )
}
