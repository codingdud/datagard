import { Sparkles } from 'lucide-react'
import { statusTone } from '../utils/format'

export default function DecisionTable({ rows, selectedId, onSelect }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {['Decision', 'Record', 'Field', 'Action', 'Confidence', 'Model', 'Status', 'Timestamp'].map((h) => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr
              key={d.id} tabIndex={0} className={d.id === selectedId ? 'selected' : ''}
              aria-label={`Open decision ${d.id}`}
              onClick={() => onSelect(d.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(d.id))}
            >
              <td className="dec-id">{d.id}</td>
              <td className="strong">{d.record}</td>
              <td className="mono muted">{d.field}</td>
              <td>{d.action}</td>
              <td>
                <div className="conf">
                  <span className="bar" style={{ width: 100 }}>
                    <i className={d.confidence >= 90 ? '' : d.confidence >= 80 ? 'mid' : 'low'} style={{ width: `${d.confidence}%` }} />
                  </span>
                  <b>{d.confidence}%</b>
                </div>
              </td>
              <td><span className="model"><Sparkles size={13} />{d.model}</span></td>
              <td><span className={`tag ${statusTone(d.status)}`}>{d.status}</span></td>
              <td className="muted" style={{ fontSize: 12.5 }}>{d.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
