# Agile V — Living State

<!-- Updated: 2026-06-18 EOD | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C61.1 shipped** |
| **Phase** | Accept (awaiting human QA) |
| **Stage** | **verify PASS** |
| **Status** | shipped · **HITL: manual test pending** |
| **Last Updated** | 2026-06-18 |
| **Last REQ** | **REQ-0112** (C61 + C61.1) |
| **HEAD** | **`a37727b`** |

## Verify baseline

**1356/1356** · tsc · lint · build — PASS

## Shipped today (2026-06-18)

| Cycle | REQ | Commit | Summary |
|-------|-----|--------|---------|
| C60 | 0111 | `a37727b` | `visit-billing-action-gates` · cancelled-visit billing freeze · invoice detail doctor patient link |
| C61 | 0112 | `a37727b` | doctor portal refund · `assertInvoiceRefundAccess` · paid-cancel default-on refund dialog |
| C61.1 | 0112 | `a37727b` | cancel dialog UI test · menu-owned cancel · drop `onCancel` chain · remove `hideActionsRail` |

## Key paths (C60–C61.1)

- **Gates:** `visit-billing-action-gates.ts` · `appointment-invoice-create-eligibility.ts`
- **Refund RBAC:** `invoice-access.ts` · `invoice-detail-action-capabilities.ts` · `POST /api/invoices/[id]/refund`
- **Cancel+refund:** `appointment-cancel-refund.ts` · `AppointmentCancelConfirmDialog` · `useAppointmentCancelWithRefund`
- **Menu:** `AppointmentActionsMenu` — `capabilities.canCancel` (disabled row) · internal hook only
- **Surfaces:** CP list · calendar day/week/month/list · hover/popover card · `AppointmentDetailActionBar`

## Product decisions (session)

- **Patient cancel/edit:** **no** — patients book + view only; calendar owner is doctor. **Leave as-is** until new REQ (self-cancel/reschedule).
- **Cancel ⋮ row:** always visible for staff; **disabled** when RBAC denies (matches Edit/Delete pattern).

## Deferred / backlog (not started)

| Item | Notes |
|------|-------|
| Refund API route integration test | C61.1 out of scope; unit RBAC sufficient for now |
| Patient self-cancel / reschedule | New REQ-0113+ if product wants portal action + cutoff/refund policy |
| **C62** | **Specify next** — add **REQ-0113** before any feature code |

## Next session start

1. Read this file + `CHECKPOINTS.md` (none pending).
2. Human QA C60–C61.1: staff cancel+refund on list/calendar/detail; billing frozen on cancelled visit; doctor portal refund.
3. If QA PASS → close HITL; else fix cycle **C61.2** under REQ-0112 or new REQ.
4. New feature → **Specify C62** + **REQ-0113** in `REQUIREMENTS.md`.
