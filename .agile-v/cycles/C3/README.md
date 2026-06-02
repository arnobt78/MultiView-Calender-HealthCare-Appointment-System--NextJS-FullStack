# Cycle C3 — Calendar scope, filters, billing

<!-- Living cycle — archive on Human Gate 2 (GATE-0006) -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0009..0012 |
| **ART-IDs** | ART-0049..0070 |
| **Bootstrap** | 2026-06-01 (retroactive) |
| **Code commits** | `30d9fd3`, `47c4913`, `297cd51` |
| **Gate 1** | GATE-0005 (pending) |
| **Gate 2** | GATE-0006 (pending) |

## Scope summary

1. **REQ-0009** — Staff calendar scope (owner OR treating) + curated demo appointments seed.
2. **REQ-0010** — Dashboard category/patient filters + clinical role + empty state.
3. **REQ-0011** — Invoice billing 4 KPI cards; org billing full list; outstanding excludes refunded.
4. **REQ-0012** — SSR prefetch all org billing + `byOrganizationTotals`; shared outstanding statuses; clinical empty dash.
5. **ART-0069/0070** — `GET /api/invoices/billing-totals` + SSR totals prefetch (589 tests, 2026-06-02).

## Archive procedure (Gate 2)

Copy frozen snapshots from living docs:

- `STATE.md`, `REQUIREMENTS.md`, `BUILD_MANIFEST.md`, `TEST_SPEC.md`, `VALIDATION_SUMMARY.md`, `DECISION_LOG.md` (C3 slice)

Then set `STATE.md` → C3 closed, C4 ready.
