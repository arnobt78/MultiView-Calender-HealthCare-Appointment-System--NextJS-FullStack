# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-02)

- **Doctor portal billing:** `DoctorPortalInvoicesCard` — stacked header (`PortalPanelSubsectionHeader`): possessive title, total count, status chip (`doctor-portal-billing-display.ts`). Rows: `DoctorPortalInvoiceListRow` + `InvoiceListPatientStrip` / `InvoiceVisitListMeta` / `InvoiceIssuedByMeta`. SSR `prefetchInvoices` seeds visit_summary + issuer labels. No manual Create Draft on portal (`DOCTOR_PORTAL_BILLING_SHOW_MANUAL_CREATE`).
- **Doctor portal patients:** `DoctorPortalPatientsCard` — same header pattern; `doctor-portal-patients-display.ts` (Active/Inactive chip). Roster from `usePatients` + `primary_doctor_id` scope.
- **Confirm dialogs:** `ConfirmActionDialog` + `confirm-delete-dialog-copy.tsx` — portal invoice/schedule/visit-type actions; CP `GlobalAppointmentTypesEditor` delete (`buildCpAdminAppointmentTypeDeleteConfirmSubtitle`). Dropdown deletes: dialog sibling of menu (fragment).
- **Visit types:** Portal owned fee + disable/delete confirms; CP admin-all global/custom delete confirm. Mutations → `invalidateAppointmentTypeDerived`.
- **Invalidation / SSR:** Portal page seeds `doctorPortal.all`, `patients.all`, invoices, schedule settings; hooks unchanged.
- **Verify:** `npm test` **623** / **113** files, tsc, lint, build.

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

`calendar/export`, `calendar/sync`, `appointments/search` = owner-only. Legacy raw `AlertDialog` on some CP detail forms (org, appointment detail) — migrate to `ConfirmActionDialog` if UX parity needed. Assignee / `?ids=` treating OR gap unchanged.

## Principle

Minimal typed diffs; shared abstractions; preserve cache/SSR/invalidation unless task requires change.
