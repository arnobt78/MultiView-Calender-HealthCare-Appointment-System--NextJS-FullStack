# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-02)

- **Doctor portal billing:** `DoctorPortalInvoicesCard` — stacked header (`PortalPanelSubsectionHeader`): possessive title, total count, status chip (`doctor-portal-billing-display.ts`). Rows: `DoctorPortalInvoiceListRow` + `InvoiceListPatientStrip` / `InvoiceVisitListMeta` / `InvoiceIssuedByMeta`. SSR `prefetchInvoices` seeds visit_summary + issuer labels. No manual Create Draft on portal (`DOCTOR_PORTAL_BILLING_SHOW_MANUAL_CREATE`).
- **Doctor portal patients:** `DoctorPortalPatientsCard` — same header pattern; `doctor-portal-patients-display.ts` (Active/Inactive chip). Roster from `usePatients` + `primary_doctor_id` scope.
- **Confirm dialogs:** `ConfirmActionDialog` + `confirm-delete-dialog-copy.tsx` — invoice delete, owned-type delete/disable, global-type disable (warning), weekly hours delete, unavailable dates delete. Invoice menu: controlled dialog sibling of dropdown (not nested `AlertDialog`).
- **Visit types (portal):** Owned types — visit fee on create/edit (`appointment-type-price.ts`, `VisitFeeBadge`). Global/owned disable = confirm before off; owned delete = destructive confirm.
- **Staff scope / invalidation:** Unchanged — `invalidateAppointmentTypeDerived`, `invalidateDoctorSchedule`, `invalidateInvoicesBilling`, `patients.all` + `doctorPortal.all` seeds on portal page.
- **Verify:** `npm test` **621** / **112** files, tsc, lint, build.

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

- Portal panels: `doctor-portal-billing-display.ts`, `doctor-portal-patients-display.ts`, `doctor-portal-layout.ts`, `components/doctor-portal/*`
- Confirm copy: `confirm-delete-dialog-copy.tsx`, `ConfirmActionDialog.tsx`
- Billing rows: `invoice-list-row-display.ts`, `invoice-visit-summary.ts`, `components/shared/billing/*`
- Schedule editors: `components/shared/doctor-settings/*`
- Query/SSR: `query-keys.ts`, `query-client.ts`, `server-prefetch.ts`, `app/doctor-portal/page.tsx`

## Follow-ups (optional)

`calendar/export`, `calendar/sync`, `appointments/search` = owner-only. Assignee batch / `?ids=` treating OR gap unchanged.

## Principle

Minimal typed diffs; shared abstractions; preserve cache/SSR/invalidation unless task requires change.
