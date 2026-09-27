const C = 210
const rad = (deg) => (deg * Math.PI) / 180

export default function GovernanceWheel({ items, overall, activeKey, onSelect }) {
  return (
    <svg className="wheel" viewBox="0 0 420 420" role="group" aria-label={`AI governance overall ${overall}%`}>
      <defs>
        <radialGradient id="core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity=".45" />
          <stop offset="100%" stopColor="#1e2350" stopOpacity=".6" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r={150} fill="none" stroke="#2a3350" strokeWidth="1" />
      <circle cx={C} cy={C} r={110} fill="none" stroke="#252d48" strokeWidth="1" strokeDasharray="3 5" />
      {items.map((p, i) => {
        const a = rad(-90 + i * 60)
        const x = C + 150 * Math.cos(a), y = C + 150 * Math.sin(a)
        const nx = C + 110 * Math.cos(a), ny = C + 110 * Math.sin(a)
        const ix = C + 62 * Math.cos(a), iy = C + 62 * Math.sin(a)
        const active = activeKey === p.key
        // Label sits just outside the outer ring, pushed further out on top/bottom.
        const lx = C + 172 * Math.cos(a), ly = C + 172 * Math.sin(a)
        return (
          <g key={p.key} role="button" tabIndex={0} aria-label={`${p.name} ${p.score}%`}
            onClick={() => onSelect(p.key)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p.key))}>
            <line x1={ix} y1={iy} x2={x} y2={y} stroke={active ? '#818cf8' : '#2f3a5c'} strokeWidth="1" />
            <circle cx={nx} cy={ny} r={active ? 5 : 3.5} fill={active ? '#a5b4ff' : '#6366f1'} />
            <circle cx={x} cy={y} r={active ? 6 : 4} fill="#0f1522" stroke={active ? '#a5b4ff' : '#4f5a86'} strokeWidth="1.5" />
            <text x={lx} y={ly - 4} textAnchor="middle" fill="#8b95a7" fontSize="8.5" letterSpacing="1.2">{p.name.toUpperCase()}</text>
            <text className="score" x={lx} y={ly + 14} textAnchor="middle" fill="#f5f7fa" fontSize="16" fontWeight="600">{p.score}</text>
          </g>
        )
      })}
      <circle cx={C} cy={C} r={62} fill="url(#core)" stroke="#4f56b8" strokeWidth="1" />
      <text x={C} y={C - 4} textAnchor="middle" fill="#f5f7fa" fontSize="22" fontWeight="600">{overall.toFixed(1)}%</text>
      <text x={C} y={C + 16} textAnchor="middle" fill="#8b95a7" fontSize="7.5" letterSpacing="1.4">AI GOVERNANCE</text>
    </svg>
  )
}
