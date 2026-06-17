# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-17)

- **C46:** Portal `/patients/*` `ClinicianInvoiceDialogShell` + SSR `prefetchInvoices` (Edit invoice works). Snapshot slim — `invoices:[]`, patient-scoped `invoice.count` only.
- **C45:** `InvoiceClinicalListTable` on appt/patient detail Related Billing; `invoice-entity-list-filters.ts`; hub DRY.
- **C44:** Dialog parity — `enrichFullAppointmentDialogSeeds`, `AppointmentStatusSelect`, past slot chip highlight.
- **C43:** Detail edit via `AppointmentDialogController`; body skeleton; assignees + invalidation (no `router.refresh`).
- **Verify:** **1254/1254** · tsc · lint · build PASS.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` (+ notifications) |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / billing helpers + `invalidateNotificationsAndCrossTab` on delete |
| Organization | `invalidateOrganizations` / `invalidateOrganizationDetail` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts`.

## Invoice SSR shells

- **CP:** `control-panel/layout.tsx` → `ClinicianInvoiceDialogShell` + `ControlPanelSsrCacheSeed`
- **Portal:** `appointments/layout.tsx` · `patients/layout.tsx` · `invoices/layout.tsx` — each SSR `prefetchInvoices`
- **Patient detail:** `usePayments` + `filterInvoicesForPatient`; snapshot badge count only (`patient-snapshot-data.ts`)

## Auth Navigation (C37)

- **Nav:** `beginAuthNavigation` → `window.location.replace(dest)`; pending-guard skips double-fire
- **Spinner:** `AUTH_NAV_PENDING_KEY` (sessionStorage); `isAuthNavPendingForPath` init loading
- **Seed:** `seedAuthMeFromLoginResponse` → `queryKeys.auth.me`; `NavSessionSsrSeed` on dest mount
- **Gate:** `shouldRunAuthenticatedAppQueries(pathname)` blocks dashboard on auth paths
- **Provider:** `GoogleCalendarSyncProviderInner` always mounted; `enabled={isStaff}` gates query

## Google Calendar (C36)

- **Path:** `/control-panel/google-calendar` · OAuth → `?gcal=connected` · `invalidateGoogleCalendarAndCrossTab`
- **Sync:** `google-calendar-sync-appointment.ts` · `GoogleCalendarSyncContext` · dashboard + detail SSR seed
- **Telehealth:** `TelehealthQueuePage` · `is_telehealth` filter · join→`VideoCall`
- **Sentry:** tunnel `POST /api/monitoring` · `sentry-client-init.ts`

## Key paths

- Entity detail: `EntityDetailPageShell` · `InvoiceClinicalListTable` · `PatientDetailScreen`
- Role routes: `entity-routes.ts` — admin CP · doctor/patient portal
- CP lists: `cp-clinical-list-table-classes.ts`

## Agile V

`.agile-v/STATE.md` · **C46 verify PASS** · **1254/1254**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
