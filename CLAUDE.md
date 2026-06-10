# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-10)

- **C11 global parity:** `query-body-loading.ts` (`useQueryBodyLoading`); removed `isMounted` from portal cards, insights, entity detail, scheduling editors/calendar.
- **Invalidation:** `useNotifications` → `invalidateNotificationsAndCrossTab`; booking dialog drops redundant portal invalidate (appointment helper covers it).
- **Cross-tab:** BroadcastChannel + localStorage + SSE — no Redis.
- **C10 recap:** CP zero-flash SSR seeds, chrome sync, navbar auth/me seed, EntityListShell.
- **Verify:** **875/875** · tsc · lint · build PASS.
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

- Page chrome: `query-body-loading.ts`, `cp-list-query-ssr-seed.ts`, `ControlPanelChromeActionsServer.tsx`, `control-panel-chrome-sync-store.ts`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop every prompt: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md` (24). **C11** (REQ-0054); **875/875**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
