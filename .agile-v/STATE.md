# Agile V — Living State

<!-- Updated: 2026-06-19 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C65 shipped** (verify PASS, uncommitted) |
| **Phase** | Accept |
| **Stage** | **verify PASS** |
| **Status** | **ER-C65-VERIFY PASS** · **1389/1389** |
| **Last Updated** | 2026-06-19 |
| **Last REQ** | **REQ-0116** (C65) |
| **HEAD** | C62–C65 changes uncommitted |

## Verify baseline

**1389/1389** · tsc · lint · build — PASS · DB seeded v3 (`db:reset-demo-appointments`)

## Shipped (C65 — REQ-0116)

| Area | Summary |
|------|---------|
| Issued-by actor | `invoice-issued-by-display` — `created_by_*` on all list/portal meta surfaces |
| Seed v3 | 10 curated rows; `invoiceCreatedByEmail` admin vs doctor; marker `v3` |
| Demo users | Mostly test@admin / test@doctor / test@patient + 2 mixed patients |

## Key paths (C65)

- **Display:** `invoice-issued-by-display.ts` · `InvoiceIssuedByMeta.tsx`
- **Seed:** `demo-appointment-curated-spec.ts` · `demo-appointment-curated-seed.ts` · `db:reset-demo-appointments`

## Next session start

1. Read this file + `CHECKPOINTS.md` (none pending).
2. Manual QA: row #01 admin issued vs #02 doctor issued on patient portal; row #03 mark-done.
3. Commit C62–C65 batch when ready.
4. New feature → **Specify C66** + **REQ-0117**.
