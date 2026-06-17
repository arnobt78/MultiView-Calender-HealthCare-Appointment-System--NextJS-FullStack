# Cycle C48 — Appointment/invoice UX + doctor RBAC parity

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0099 |
| **Bootstrap** | 2026-06-17 |
| **Parent** | REQ-0098 (C47) |

## Scope

- Doctor `office_location` in SSR doctors prefetch → location prefill on create
- Dialog close + Sonner on save (revert C43.1 post-create sharing step)
- Mark done emerald glass outline; invoice visit title → appointment detail
- Owner + treating physician mutate on linked appointments/invoices
- Inline category duration badge in appointment-management table

## Key paths

`server-prefetch.ts` · `AppointmentDialog.tsx` · `invoice-visit-title-href.ts` · `appointment-access.ts` · `invoice-access.ts` · `appointment-table-cells.tsx`
