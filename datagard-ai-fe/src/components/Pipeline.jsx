import { ChevronRight } from 'lucide-react'
import { ICONS } from '../utils/icons'

export default function Pipeline({ steps }) {
  return (
    <section className="card card-pad" aria-label="Data quality pipeline">
      <div className="card-head">
        <div>
          <h2 className="card-title">Data quality pipeline</h2>
          <p className="card-sub">From raw ingestion to governed insight</p>
        </div>
        <span className="ok" style={{ fontSize: 12 }}><span className="dot pulse" />Processing live</span>
      </div>
      <div className="pipeline">
        {steps.map((s, idx) => {
          const Icon = ICONS[s.icon]
          return (
            <div key={s.step} style={{ display: 'contents' }}>
              <div className="pipe-node">
                <div className="pipe-top"><Icon size={18} /><span className="pipe-step">{s.step}</span></div>
                <div>
                  <div className="pipe-title">{s.title}</div>
                  <div className="pipe-sub">{s.sub}</div>
                </div>
              </div>
              {idx < steps.length - 1 && <div className="pipe-link" aria-hidden="true"><ChevronRight size={16} /></div>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
