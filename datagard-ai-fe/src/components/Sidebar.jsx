import { NavLink } from 'react-router-dom'
import { Gauge, Database, FileCheck2, Layers, Settings, ShieldCheck, Sparkles } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/records', label: 'Record Explorer', icon: Database },
  { to: '/decisions', label: 'AI Decision Ledger', icon: FileCheck2, badge: 5 },
  { to: '/pillars', label: 'Six Pillars', icon: Layers },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo"><ShieldCheck size={22} color="#fff" /></div>
        <div>
          <div className="brand-name">DataGuard <span>AI</span></div>
          <div className="brand-sub">Data quality command center</div>
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>
      <nav className="nav" aria-label="Primary">
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} title={label} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            <span className="nav-text">{label}</span>
            {badge && <span className="badge-count">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="side-spacer" />

      <div className="side-block">
        <div className="side-icon"><Sparkles size={17} /></div>
        <div style={{ flex: 1 }}>
          <div className="side-title">Data quality</div>
          <div className="side-sub">All systems operational</div>
        </div>
        <span className="dot" />
      </div>
      <div className="side-block">
        <div className="avatar">AD</div>
        <div style={{ flex: 1 }}>
          <div className="side-title">Admin</div>
          <div className="side-sub">Governance lead</div>
        </div>
        <button className="icon-btn" aria-label="Settings"><Settings size={17} /></button>
      </div>
    </aside>
  )
}
