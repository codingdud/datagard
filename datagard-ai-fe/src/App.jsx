import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import RecordExplorer from './pages/RecordExplorer'
import DecisionLedger from './pages/DecisionLedger'
import SixPillars from './pages/SixPillars'

function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <main className="content"><Outlet /></main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/records" element={<RecordExplorer />} />
        <Route path="/decisions" element={<DecisionLedger />} />
        <Route path="/pillars" element={<SixPillars />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
