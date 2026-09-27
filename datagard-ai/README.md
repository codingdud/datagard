# DataGuard AI – API (BFF)

Express layer between the React UI and Microsoft Fabric. React never talks to Fabric directly, and `raw_records`
is never modified: human decisions are written to `approved_records`, `human_review_queue` and `ai_decision_ledger`
in a single transaction.

## Setup

```
npm install
cp .env.example .env     # then fill in real values
npm run dev              # http://localhost:5000
npm test
```

`.env`: `PORT`, `CORS_ORIGIN` (comma list, default UI is `http://localhost:5173`), `AZURE_TENANT_ID`,
`AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `FABRIC_SERVER`, `FABRIC_DATABASE`.
The service principal needs access to the Fabric workspace. Until real values are set, data endpoints return
`503 Microsoft Fabric is not configured`.

Table DDL the code expects: [docs/schema.sql](docs/schema.sql).
**A Lakehouse SQL endpoint is read-only** – the tables the API writes to must live in a Fabric Warehouse.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Process liveness |
| GET | `/api/health` | Fabric connectivity (503 if unreachable) |
| GET | `/api/dashboard` | KPIs, issue counts, 7-day trend |
| GET | `/api/reviews?status&issueType&search&page&pageSize` | Human-review queue (default `PENDING`) |
| GET | `/api/records/:id` | Record + quality + issues + recommendations |
| POST | `/api/reviews/:id/approve` | `{ reviewerId, comment? }` |
| POST | `/api/reviews/:id/reject` | `{ reviewerId, comment? }` |
| POST | `/api/reviews/:id/edit` | `{ reviewerId, value, field?, comment? }` |
| GET | `/api/decisions?recordId&action&status&confidenceMin&page&pageSize` | Decision ledger |
| GET | `/api/decisions/:id` | Decision detail |
| GET | `/api/governance/pillars` | Six-pillar scores |

Confidence values are 0–1. Reviews resolve once (`409` if already decided).

## Layout

`routes → controllers → services → repositories/fabric.repository.js (mssql, service-principal auth)`
