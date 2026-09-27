import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fmt } from '../utils/format'

export default function RecordStatus({ data, total = 50000 }) {
  const navigate = useNavigate()
  const trusted = data.find((d) => d.name === 'Trusted')
  return (
    <section className="card card-pad" aria-label="Record status" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-head">
        <div>
          <h2 className="card-title">Record status</h2>
          <p className="card-sub">Distribution across {fmt(total)} records</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 190, height: 190 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="none" startAngle={90} endAngle={-270}>
                {data.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v, n, p) => [`${v}% · ${fmt(p.payload.count)} records`, n]} contentStyle={{ background: '#182031', border: '1px solid #202938', borderRadius: 10, fontSize: 12 }} itemStyle={{ color: '#f5f7fa' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>{total / 1000}K</div>
            <div className="muted" style={{ fontSize: 11 }}>records</div>
          </div>
        </div>
        <div className="legend">
          {data.map((d) => (
            <div className="legend-row" key={d.name}>
              <span className="sq" style={{ background: d.color }} />
              <span>{d.name}</span>
              <span className="val">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card-foot">
        <span><b style={{ color: '#f5f7fa' }}>{trusted?.value}%</b> trusted data</span>
        <button className="icon-btn" aria-label="Open Record Explorer" onClick={() => navigate('/records')}><ArrowUpRight size={15} /></button>
      </div>
    </section>
  )
}
