import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

const META = {
  '/dashboard': ['Dashboard', 'Executive dashboard', 'Real-time data quality and governance overview'],
  '/records': ['Record Explorer', 'Record Explorer', 'Inspect records, detected issues, and AI recommendations'],
  '/decisions': ['AI Decision Ledger', 'AI Decision Ledger', 'Transparent audit trail of every AI-assisted data quality decision'],
  '/pillars': ['Six Pillars', 'Six Pillars', 'Monitor the governance characteristics of your quality system'],
}

export default function Header() {
  const { pathname } = useLocation()
  const [crumb, title, sub] = META[pathname] || META['/dashboard']
  return (
    <header className="header">
      <div>
        <div className="crumb">Workspace / {crumb}</div>
        <h1 className="title">{title}</h1>
        <p className="subtitle">{sub}</p>
      </div>
      <div className="header-right">
        <div className="status-pill"><span className="dot" />Fabric connected</div>
        <button className="icon-btn bordered" aria-label="Notifications"><Bell size={16} /><span className="notif-dot" /></button>
        <div className="avatar" title="Admin">AD</div>
      </div>
    </header>
  )
}
