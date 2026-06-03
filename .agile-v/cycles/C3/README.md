# Cycle C3 — Calendar scope, filters, billing, insights KPI

<!-- Living cycle — archive on Human Gate 2 (GATE-0006) -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0009..0015 |
| **ART-IDs** | ART-0049..0085 |
| **Bootstrap** | 2026-06-01 (retroactive); extension 2026-06-02 |
| **Code commits** | `30d9fd3`, `47c4913`, `faee3f7`, `6f13cc2` |
| **Gate 1** | GATE-0005 (pending) |
| **Gate 2** | GATE-0006 (pending) |

## Scope summary

1. **REQ-0009** — Staff calendar scope (owner OR treating OR assignee) + curated demo seed.
2. **REQ-0010** — Dashboard category/patient filters + clinical role + empty state.
3. **REQ-0011** — Invoice billing KPI cards; org billing full list; outstanding excludes refunded.
4. **REQ-0012** — SSR prefetch all org billing + `byOrganizationTotals`; clinical empty dash.
5. **REQ-0013** — Assignee scope on export/sync/search/portal/login-today (`faee3f7`).
6. **REQ-0014** — Insights telehealth % follows View-as period (`fetchTelehealthShareForPeriod`).
7. **REQ-0015** — Invoice revenue KPI grid + insights billing parity (`6f13cc2`).

## Verify evidence

638/638 Vitest, tsc, lint, build — `ER-C3-VERIFY` (2026-06-02).

## Archive procedure (Gate 2)

Copy frozen snapshots from living docs → set `STATE.md` C3 closed → C4 ready.
