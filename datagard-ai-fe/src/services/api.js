// Single integration point. To go live with Microsoft Fabric, replace the
// bodies below with fetch() calls to your Fabric REST endpoints
// (set VITE_FABRIC_API_URL). Components never import mock data directly.
import { dashboard, records, decisions, pillars } from '../data/mockData'

const LATENCY = 450
const clone = (v) => JSON.parse(JSON.stringify(v))
const respond = (data) => new Promise((res) => setTimeout(() => res(clone(data)), LATENCY))

// Live shape example:
// const BASE_URL = import.meta.env.VITE_FABRIC_API_URL
// async function request(path, opts) {
//   const r = await fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${token}` }, ...opts })
//   if (!r.ok) throw new Error(`Fabric API ${r.status}`)
//   return r.json()
// }

export const getDashboardMetrics = () => respond(dashboard)
export const getRecords = () => respond(records)
export const getRecordById = async (id) => {
  const rec = records.find((r) => r.id === id)
  if (!rec) throw new Error(`Record ${id} not found`)
  return respond(rec)
}
export const getDecisionLedger = () => respond(decisions)
export const getDecisionById = async (id) => {
  const d = decisions.find((x) => x.id === id)
  if (!d) throw new Error(`Decision ${id} not found`)
  return respond(d)
}
export const getSixPillarMetrics = () => respond(pillars)

// Mutation (mock): would POST the reviewer's decision to Fabric
export const submitRecordDecision = (id, payload) => respond({ id, ...payload, ok: true })
