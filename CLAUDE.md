# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-12)

- **C28 (REQ-0076):** CP all-time KPI footers; org/doctor filters in billing header; status-only `billing-totals`; `seedControlPanelSectionCacheFromSsr` single seed.
- **C27.2 (REQ-0075):** Server status KPIs; org panel DRY; management cache patch.
- **C27/C27.1 (REQ-0073/74):** Scoped `doctorId`/`orgId` API; `useInvoiceScopedBilling`; merge/remove/patch + `viewerTotals` SSR.
- **Verify:** **1044/1044** · tsc · lint · build PASS.

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

## Invoice hub (C27–C28)

- **Scope:** `invoice-management-scope.ts` URL; `InvoiceManagementScopeContext`; `OrganizationFilterSelect` + `DoctorFilterSelect` in billing header.
- **Data:** `useInvoiceScopedBilling` · keys `viewerTotals` / `byOrganization` / `byDoctor` (+ totals).
- **Server:** `invoice-doctor-scope.ts` · `invoice-billing-kpi-aggregate.ts` (status-only for CP API).
- **Cache:** `mergeInvoiceIntoScopedListCaches` · `removeInvoiceFromScopedListCaches` · `patchScopedTotalsFromListCaches` · `computeInvoiceBillingManagementPayloadFromList`.
- **UI:** `InvoiceManagementBillingSectionHeading` · `InvoiceBillingStatsRow` (all-time) · `invoiceKpiValueRowHint`.
- **SSR:** `invoice-management/page.tsx` · `seedControlPanelSectionCacheFromSsr` · `OrgBillingCachePayload.billingKpi`.

## Key paths

- Filters: `FilterSelect`, `filter-select-option-presets.ts`, `DoctorFilterSelect`, `OrganizationFilterSelect`
- Org billing: `OrganizationBillingPanel` · `org-billing-prefetch.ts`
- CP lists: `cpClinicalListTableFrameClassName` + tone shells
- Entity detail: `EntityDetailPageShell`, `EntityDetailBackLink`, `EntityDetailFooterRow`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C28 shipped** (REQ-0076).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
