# Agile V — Living State

<!-- Updated: 2026-06-11 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C28** — CP billing all-time KPI UX + seed consolidation |
| **Phase** | Accept |
| **Stage** | 5 |
| **Status** | verify PASS |
| **Last Updated** | 2026-06-11 |
| **Parent REQ** | REQ-0076 |
| **HEAD** | (pending commit) |

## Verify baseline (C28 close)

**1044/1044** (209 files) · tsc · lint · build — PASS

## C28 scope (REQ-0076)

- CP KPI cards: all-time count footers (`2 paids`), no calendar month hint.
- Org/doctor scope filters inline in billing header row.
- CP billing-totals: status aggregates only; extended KPIs from scoped list client-side.
- `seedControlPanelSectionCacheFromSsr` — single CP SSR seed path.

## C27.2 scope (REQ-0075)

- Server paid-period + extended KPIs (insights path retained).
- Org panel DRY via `useInvoiceScopedBilling`.

## C27.1 scope (REQ-0074)

- Mutation cache parity + viewer totals SSR seed.

## Verify baseline (C25 close)

**1001/1001** (201 files) · tsc · lint · build — PASS
