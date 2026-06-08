# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-08)

- **Portal KPI:** doctor-portal + `/insights` Today/Pending `valueRowHint` + all-time pending count; CP `cancelled`; `dailyStatsMap` helpers.
- **Cancelled counters:** `AppointmentOpenAlertDoneBadges` on list/Day/Week/Month/section accordion.
- **Demo appts:** `npm run db:reset-demo-appointments` — 10 curated v2 + cancelled check migration.
- **Verify:** **843** / **161** · `npm test && tsc && lint && build`.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
