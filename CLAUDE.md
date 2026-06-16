# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-16)

- **C41.1:** Targeted billing chip skeleton when `invoices.all` cold only · `instrumentation-client.ts` + `sentry-client-init.ts` Sentry tunnel `/api/monitoring`.
- **C40 (REQ-0091):** `/telehealth-queue` portal · navbar · role-aware links · telehealth booking preset · `?filter=` URL tabs (no sessionStorage) · `useCpListBodyLoading(appointments.all)` only.
- **C39:** `is_telehealth` filter · violet glass · `telehealth/*` · SSR appointments + doctors seed.
- **Verify:** **1220/1220** · tsc · lint · build PASS.

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

## Notifications (C34)

- **Libs:** `notification-link.ts` · `notification-link-validity.ts` · `notification-list-filter.ts` · `notification-navigation.ts` · `entity-unavailable-copy.ts`
- **UI:** CP `NotificationsManagement` · navbar bell · `EntityUnavailableScreen` · clickable Notification column (C35)
- **Stale policy:** delete → null link + suffix; `link_valid` gates View/Open/filter; cleanup awaited on DELETE (try/catch)
- **Export:** `export-notifications-csv.ts` — `Link` + `Link Valid` audit cols (C35.1)
- **SSR:** `prefetchNotifications` → `listEnrichedNotificationsForUser` · SSE invalidates → refetch enriched rows

## Auth Navigation (C37)

- **Nav:** `beginAuthNavigation` → `window.location.replace(dest)` (hard nav, no proxy flash); pending-guard skips double-fire same from+dest
- **Spinner:** `AUTH_NAV_PENDING_KEY` (sessionStorage) survives remounts; `isAuthNavPendingForPath` initializes button `loading` state
- **Seed:** `seedAuthMeFromLoginResponse` seeds `queryKeys.auth.me` before nav; `NavSessionSsrSeed` overwrites stale null on destination mount
- **Gate:** `shouldRunAuthenticatedAppQueries(pathname)` blocks dashboard queries on bare auth paths
- **Provider:** `GoogleCalendarSyncProviderInner` always mounted; `enabled={isStaff}` gates query (stable tree — prevents Login/Landing remount on auth seed)

## Google Calendar (C36 / C36.1 / C36.2)

- **Path:** `/control-panel/google-calendar` · `GoogleCalendarSettings` + `google-calendar/*` panels
- **OAuth:** callback → CP `?gcal=connected` · `google-calendar-routes.ts` · `invalidateGoogleCalendarAndCrossTab`
- **Sync:** `google-calendar-sync-appointment.ts` · cancel/DELETE unlink · PUT/PATCH shared side-effects · `GoogleCalendarSyncContext` (one hook)
- **Hook:** `useGoogleCalendar({ enabled? })` (CP page) · `useGoogleCalendarSyncOptional` (cards/menus/detail) · dashboard + appointment detail SSR seed
- **Error policy:** 404/401 → `{connected:false}`; 500/network → throw. Events failure → `eventsFetchWarning` banner, stays connected.
- **Telehealth:** `TelehealthQueuePage` · `AppointmentVisitMetaBadgeRow` · `appointment-visit-meta-resolve.ts` · `?filter=` URL tabs · invoice SSR (`invoices.all` + `doctors.all`) · join→`VideoCall` · detail `resolvePortalAppointmentDetailLinkPolicy`
- **OAuth UX:** `gcalOAuthReturn` SSR · `oauthLatched` · `google-calendar-status-ui.ts` (silent KPI refetch)
- **Sentry:** `instrumentation-client.ts` · `sentry-client-init.ts` · tunnel `POST /api/monitoring` · `sentry-tunnel.ts` DSN guard

## Key paths

- CP lists: `cp-clinical-list-table-classes.ts` · `notification-type-display.ts`
- Entity detail: `EntityDetailPageShell` · `EntityUnavailableScreen`
- Role routes: `entity-routes.ts` — admin `/control-panel/*` · doctor/patient portal routes

## Agile V

`.agile-v/STATE.md` · **C41 verify PASS** · **1220/1220**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
