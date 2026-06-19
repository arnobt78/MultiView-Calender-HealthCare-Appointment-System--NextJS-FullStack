# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-19)

- **C67:** month view parity — `AppointmentDialogController` `isOpen` · side-panel close · `calendar-date-display` en-US · Create Invoice seeds `billing-appointment-option-from-calendar` + `queryKeys.users.search`
- **C66:** `InvoiceVisitTitleRow` · cancel dialog pending · demo `pi_demo_curated_*` refund local-only · portal invoice/timeline polish
- **C65 (REQ-0116):** issued-by = `created_by_*` · curated seed v3
- **C64 (REQ-0115):** done→draft invoice cache · `appointment-done-billing-sync` · visit snapshot soft-delete
- **Verify:** **1404/1404** · tsc · lint · build PASS

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

`.agile-v/STATE.md` · **C67 shipped** · **1404/1404** · REQ-0116.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
