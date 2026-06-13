# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-13)

- **C32.1:** Title row inline visit status; billing col (fee/invoice/payment); category `compactStack` (mark + label / duration badge rows).
- **C32 (REQ-0080):** CP appointment-management shell/DataTable/filters/stats; SSR `appointments_mgmt` + parallel `prefetchInvoices`.
- **Verify:** **1076/1076** · tsc · lint · build PASS.

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

## Key paths

- CP list shells: `cp-clinical-list-table-classes.ts` · identity tokens `clinical-identity-inline-ui.ts`
- Entity detail: `EntityDetailPageShell`, `EntityDetailBackLink`, `EntityDetailFooterRow`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C32 shipped** (REQ-0080).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
