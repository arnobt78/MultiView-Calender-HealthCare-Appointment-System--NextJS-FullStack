# Agile V — Living State

<!-- Updated: 2026-06-11 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C30** — invoice Record Audit parity + dialog UX fixes |
| **Phase** | Accept (complete) |
| **Stage** | 5 |
| **Status** | verify PASS · shipped |
| **Last Updated** | 2026-06-11 |
| **Parent REQ** | REQ-0078 |
| **HEAD** | `fe84f2b` |

## Verify baseline (C30 close)

**1057/1057** (213 files) · tsc · lint · build — PASS

## C30 scope (REQ-0078)

- Invoice audit FKs + `invoice-api-include` / `invoice-api-enrich`.
- Write stamps POST/PATCH/pay/refund/draft/webhook; detail Record Audit parity.
- `ClinicalGlassDatePicker` close-on-select; edit amount locked hint.
- `db:backfill-invoice-audit`.

## C29 scope (REQ-0077)

- CP invoice table UX: `cpTwoLine` #, `compactStack`, `amount_status`, sky issuer.

## C28 scope (REQ-0076)

- CP all-time KPI footers; inline org/doctor scope filters; status-only billing-totals.

## Next cycle

**C31** — Specify new REQ in `REQUIREMENTS.md` before any new code. No PENDING HITL (`CHECKPOINTS.md` clear).
