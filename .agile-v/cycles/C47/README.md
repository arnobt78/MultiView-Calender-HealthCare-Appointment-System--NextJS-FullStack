# Cycle C47 — Appointment detail audit, billing UX, telehealth video, header actions

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0098 |
| **Bootstrap** | 2026-06-17 |
| **Parent** | REQ-0097 (C46) |
| **Shipped** | `1e252b0` (with C48) |

## Scope

- Invoice issued audit → `created_by` actor on appointment detail
- Billing option cache seed from detail view-model (no New Invoice skeleton)
- Footer Edit Invoice + telehealth Video gate + header quick actions
- Deleted `AppointmentDetailBillingActions.tsx`

## Key paths

`appointment-detail-invoice-audit-rows.tsx` · `billing-appointment-option-from-detail.ts` · `AppointmentDetailHeaderQuickActions.tsx` · `AppointmentDetailActionBar.tsx`
