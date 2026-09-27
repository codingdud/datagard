export const fmt = (n) => Number(n).toLocaleString('en-US')
export const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('')
export const statusTone = (s) =>
  ({ Trusted: 'success', Approved: 'success', Review: 'warning', Quarantine: 'danger', Rejected: 'danger' })[s] || 'muted'
