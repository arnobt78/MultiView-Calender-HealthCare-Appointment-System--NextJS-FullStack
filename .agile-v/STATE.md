# Agile V — Living State

<!-- Updated: 2026-06-17 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C48.1 closed** — idle between cycles |
| **Phase** | — |
| **Stage** | **Specify C49** (no REQ yet) |
| **Status** | **idle** |
| **Last Updated** | 2026-06-17 |
| **Last REQ** | **REQ-0099** (C48) + polish **C48.1** |

## Verify baseline

**1270/1270** · tsc · lint · build — PASS

| Layer | HEAD |
|-------|------|
| **Committed** | **`8ba3acf`** (`main` = `origin/main`) |
| **Shipped** | C47 `1e252b0` · C48 + C48.1 `8ba3acf` |

## Last shipped (2026-06-17)

| Cycle | REQ | Commit | Theme |
|-------|-----|--------|-------|
| **C48.1** | 0099 | `8ba3acf` | When column inline datetime |
| **C48** | 0099 | `1e252b0` | UX regressions + doctor RBAC |
| **C47** | 0098 | `1e252b0` | Appointment detail audit + billing UX |
| **C46** | 0097 | `45c87e5` | Portal patients invoice shell |

## Resume tomorrow

1. Read `ACTIVATION.md` → `STATE.md` (this file).
2. **No open WIP** — working tree clean at `8ba3acf`.
3. **Next feature:** Specify **C49** — add **REQ-0100** in `REQUIREMENTS.md` before any code.
4. **Optional backlog:** `invoice-access` unit test for `doctorCanMutateLinkedInvoice` (non-blocking).

## Key paths (C47–C48)

`invoice-visit-title-href.ts` · `appointment-access.ts` · `invoice-access.ts` · `AppointmentDialog.tsx` · `AppointmentDetailHeaderQuickActions.tsx` · `billing-appointment-option-from-detail.ts` · `appointment-table-cells.tsx`
