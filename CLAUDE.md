# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-08)

- **Cancelled counters:** `DailyAppointmentStats.cancelled` + `AppointmentOpenAlertDoneBadges` (slate); list sticky/DateHeadline/section accordion; Day/Week/Month headers; doctor Today chip; client-only via `summarizeDayAppointments` — no API/invalidation change.
- **Patient phone:** DB + API + form + CP detail + list Phone; `phone-validation.ts`.
- **Cancel/cron:** `cancelled` status + `appointment-cancel-access.ts` + notify; cron + opt-in `brevo-sms.ts`.
- **Demo appts (local):** `npm run db:reset-demo-appointments` — 10 curated v2; uncommitted seed scripts.
- **Verify:** **837** / **160** · `npm test && tsc && lint && build`.

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
