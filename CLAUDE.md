# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-14)

- **C35 (REQ-0083):** Clickable Notification column · no Link col · disabled empty actions · no header session lead · Select fix.
- **C34.1:** CP link filter `link_valid` · DELETE awaits stale-link cleanup.
- **Verify:** **1108/1108** · tsc · lint · build PASS.

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
- **SSR:** `prefetchNotifications` → `listEnrichedNotificationsForUser` · SSE invalidates → refetch enriched rows

## Key paths

- CP lists: `cp-clinical-list-table-classes.ts` · `notification-type-display.ts`
- Entity detail: `EntityDetailPageShell` · `EntityUnavailableScreen`
- Role routes: `entity-routes.ts` — admin `/control-panel/*` · doctor/patient portal routes

## Agile V

`.agile-v/STATE.md` · **C35 shipped** (REQ-0083).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
