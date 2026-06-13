# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-11)

- **C33 (REQ-0081):** CP notifications — rose shell · stats · filters · DataTable · session lead · Export/Refresh/Mark all/Clear read/New Appt · `notification-type-display.ts` shared w/ navbar.
- **C32.1:** Appt-mgmt title inline status; billing col; category compactStack.
- **Verify:** **1084/1084** · tsc · lint · build PASS.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` / `invalidateInvoiceScopedBilling` |
| Organization | `invalidateOrganizations` / `invalidateOrganizationDetail` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts`.

## Invoice hub

- **Scope/cache:** `invoice-management-scope.ts` · `InvoiceManagementScopeContext` · `useInvoiceScopedBilling` · `mergeInvoiceIntoScopedListCaches`.
- **CP table:** `invoice-management-columns` — `invoice` · `description` · `due` · `created` · `actions`; cells in `invoice-table-cells.tsx` + `InvoiceVisitListCell`.
- **SSR:** `control-panel/invoice-management/page.tsx` · `seedControlPanelSectionCacheFromSsr`.

## Appointment CP list

- **Shell:** `AppointmentsManagement` → sky tone · `ClinicalListFilterToolbar` · `AppointmentManagementStatsRow` · `AppointmentListFiltersContext`.
- **Table:** 7-col · `appointment-invoice-lookup.ts` (single `buildAppointmentInvoiceDisplayMap` — hook delegates here).
- **SSR:** `prefetchCalendarAppointmentsBundle` + parallel `prefetchInvoices` on `appointments_mgmt`.

## Notifications CP list

- **Shell:** `NotificationsManagement` → rose tone · `NotificationManagementStatsRow` · `NotificationListFiltersContext`.
- **Shared type UI:** `notification-type-display.ts` · `NotificationTypeBadge` · navbar bell uses same config.
- **Mutations:** `useNotifications` → `invalidateNotificationsAndCrossTab` (mark one/all, delete read); SSE global in QueryProvider.
- **SSR:** `prefetchNotifications` · `seedNotificationsCacheFromSsr` · header shells Export/Refresh/Mark all/New Appt.

## Key paths

- CP list shells: `cp-clinical-list-table-classes.ts` · identity tokens `clinical-identity-inline-ui.ts`
- Entity detail: `EntityDetailPageShell`, `EntityDetailBackLink`, `EntityDetailFooterRow`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C33 shipped** (REQ-0081).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
