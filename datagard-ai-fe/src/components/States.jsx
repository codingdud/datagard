import { AlertCircle, Inbox } from 'lucide-react'

export const Skeleton = ({ h = 20, w = '100%', style }) => (
  <div className="skel" style={{ height: h, width: w, ...style }} aria-hidden="true" />
)

export const EmptyState = ({ title = 'No results', text = 'Try adjusting your search or filters.', action }) => (
  <div className="state">
    <div className="ico"><Inbox size={22} /></div>
    <h3>{title}</h3>
    <p>{text}</p>
    {action}
  </div>
)

export const ErrorState = ({ error, onRetry }) => (
  <div className="state err card" role="alert">
    <div className="ico"><AlertCircle size={22} /></div>
    <h3>Something went wrong</h3>
    <p>{error?.message || 'Could not load data from Fabric.'}</p>
    {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
  </div>
)
