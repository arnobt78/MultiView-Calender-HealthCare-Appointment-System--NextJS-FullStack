# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-02)

- **Staff calendar scope:** `staff-appointment-calendar-scope.ts` — owner **OR** treating **OR** accepted assignee (`user_id` / `invited_email`). Wired: `GET /api/appointments` (+ `?ids=`), export, sync POST, search, doctor-portal, login-today, dashboard overview (non-admin), SSR prefetch (`server-prefetch`, `control-panel-section-prefetch` passes email).
- **Doctor portal:** billing/patients stacked headers; `DoctorPortalInvoiceListRow` + display libs; SSR invoice visit summaries.
- **Confirm UI:** `ConfirmActionDialog` + `confirm-delete-dialog-copy.tsx` — portal, CP, calendar/settings; dialog **sibling** of `DropdownMenu`.
- **Org billing:** full org panels; `GET /api/invoices/billing-totals`; shared `invoice-billing-totals.ts` + `queryKeys.invoices.byOrganizationTotals`.
- **Verify:** `npm test` **629** / **113** files, tsc, lint, build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()` APIs; `dynamic = "force-dynamic"` new APIs; RBAC `rbac.ts`; `Link` internal; native checkbox.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient/category | `invalidateEntityAffectingAppointments` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` |
| Schedule | `invalidateDoctorSchedule` |
| Users | `invalidateUsersAndAuth` |

Cross-tab: `query-cache-cross-tab.ts` in `QueryProvider`.

## Key paths

- Scope: `staff-appointment-calendar-scope.ts`
- Portal: `doctor-portal-billing-display.ts`, `doctor-portal-patients-display.ts`, `components/doctor-portal/*`
- Confirm: `confirm-delete-dialog-copy.tsx`, `ConfirmActionDialog.tsx`
- Billing: `invoice-billing-totals.ts`, `org-billing-prefetch.ts`, `components/shared/billing/*`
- Query/SSR: `query-keys.ts`, `query-client.ts`, `server-prefetch.ts`, `control-panel-section-prefetch.ts`

## Principle

Minimal typed diffs; shared abstractions; preserve cache/SSR/invalidation unless task requires change.
