# Cycle C47 — Appointment detail audit, billing UX, telehealth video, header actions

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0098 |
| **Bootstrap** | 2026-06-17 |
| **Parent** | REQ-0097 (C46) |

## Scope

- Invoice issued audit → `created_by` actor on appointment detail
- Billing option cache seed from detail view-model (no New Invoice skeleton)
- Footer Edit Invoice + telehealth Video gate + header quick actions

## Key paths

`appointment-detail-invoice-audit-rows.tsx` · `billing-appointment-option-from-detail.ts` · `AppointmentDetailHeaderQuickActions.tsx` · `AppointmentDetailActionBar.tsx`
