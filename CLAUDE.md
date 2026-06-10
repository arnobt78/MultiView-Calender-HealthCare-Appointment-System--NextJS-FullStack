# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-10)

- **C10/C10.1 CP zero-flash:** `cp-list-query-ssr-seed.ts` sync seeds; hooks `initialData` + warm `refetchOnMount`; `useCpListBodyLoading`; `ControlPanelEntityListShell`; entity lists (patients/categories/doctors/users/invoices).
- **C10.1 chrome:** sync `control-panel-chrome-sync-store` (body-before-header); `ControlPanelChromeActionsServer` SSR shells + client registry; navbar `NavSessionSsrSeed` + `seedAuthMeCacheFromSsr`; admin-all visit-types prefetch (`appointmentTypes.all`).
- **C10.2 polish:** `useNotifications` cache parity; org Create → actions slot; `seedOrgBillingCacheFromSsr`; billing panel + patient detail no `isMounted`; orgs/appts EntityListShell (indigo tone).
- **Verify:** **870/870** · tsc · lint · build PASS.
- **Invalidation:** unchanged — use `query-client.ts` helpers on every CRUD.
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

- Page chrome: `AppPageChrome.tsx`, `ControlPanelPageChrome.tsx`, `ControlPanelChromeActionsServer.tsx`, `control-panel-chrome-sync-store.ts`, `cp-list-query-ssr-seed.ts`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop every prompt: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md` (24). **C10.2** (REQ-0053); **870/870**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
