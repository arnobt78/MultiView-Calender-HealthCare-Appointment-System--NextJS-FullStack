# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-18)

- **C51 (REQ-0102):** Cache-first appointment writes — `mergeAppointmentIntoAllCaches` + `syncAppointmentsAfterWrite` + `syncAfterAppointmentWrite`; cross-tab `publishAppointmentMergeCrossTab`; bulk/ICS/GCal keep `invalidateAfterAppointmentMutation`.
- **C50 (REQ-0101):** Cache-first invoice writes — `mergeInvoiceIntoAllCaches` + `syncInvoicesAfterWrite`; cross-tab `publishInvoiceMergeCrossTab`; appointment invalidation scopes (`status`/`schedule`/`billing`); patient/category/org patch-or-invalidate.
- **C49 (REQ-0100):** `stable-query-fallbacks.ts` `EMPTY_*`; `controlPanelStaffDetailHref`; doctor snapshot prefetch skip for admin users; `AppointmentDialog` loop fix retained.
- **C48.1:** `AppointmentWhenTableCell` inline datetime.
- **Verify:** **1296/1296** · tsc · lint · build PASS.

## Doctor invoice RBAC (C48)

- **API:** `invoice-access` `doctorCanMutateLinkedInvoice` — issuer OR calendar owner OR treating on linked visit.
- **UI:** `doctorCanMutateInvoice` + `viewerUserId` on list/detail menus (`InvoiceClinicalListTable`, `InvoiceDetailActionBar`).

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `syncAfterAppointmentWrite` (client CRUD) or `invalidateAfterAppointmentMutation` (ICS/GCal/SSE); scope: `status` \| `schedule` \| `billing` |
| Patient | `syncAppointmentsAfterPatientWrite` or `invalidateEntityAffectingAppointments` (create/delete) |
| Invoice | `mergeInvoiceIntoAllCaches` + `syncInvoicesAfterWrite` + `publishInvoiceMergeCrossTab`; SSE still `invalidateInvoicesAndOverview` |
| Organization | `invalidateOrganizations` (+ dashboard); skip `organizations.members` when cache merged |
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

`.agile-v/STATE.md` · **C51 shipped** · **1296/1296** · REQ-0102.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
