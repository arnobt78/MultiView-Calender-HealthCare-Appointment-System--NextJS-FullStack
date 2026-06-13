# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-11)

- **C30 (REQ-0078):** Invoice audit FKs + `invoice-api-include`/`invoice-api-enrich`; stamps on POST/PATCH/pay/refund/draft/webhook; detail Record Audit (Created/Last updated/Issued by); `mapInvoiceRecordAuditActors`; date picker close; edit amount hint; `db:backfill-invoice-audit`.
- **C29 (REQ-0077):** CP invoice table UX (`cpTwoLine`, `compactStack`, `amount_status`, sky issuer).
- **Verify:** **1057/1057** · tsc · lint · build PASS.

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
- **Table (C29):** `invoice-management-columns` — `cpTwoLine` `InvoiceNumberTableCell`, `InvoiceVisitListCell` + `compactStack`, `InvoiceAmountStatusTableCell`, `InvoiceCreatedTableCell` + linked issuer.
- **SSR:** `invoice-management/page.tsx` · `seedControlPanelSectionCacheFromSsr` · `OrgBillingCachePayload.billingKpi`.

## Key paths

- Filters: `FilterSelect`, `ScopeFilterInlineRow`, `DoctorFilterSelect`, `OrganizationFilterSelect`, `filterSelectTriggerDoctorInlineValueClass`
- Org billing: `OrganizationBillingPanel` · `org-billing-prefetch.ts`
- CP lists: `cpClinicalListTableFrameClassName` + tone shells
- Entity detail: `EntityDetailPageShell`, `EntityDetailBackLink`, `EntityDetailFooterRow`

## Agile V

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C30 shipped** (REQ-0078) · next **C31 specify**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
