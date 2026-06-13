# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-13)

- **C31 (REQ-0079):** CP invoice 5-col table — `InvoiceManagementIdentityCell` (clickable `Invoice N: #id` + copy + amount + badge); shells `cpClinicalListInvoice*` / Due / Created; `InvoiceIssuedByMeta` `compact` + `EntityDetailAuditActorInline` `compactStack` issuer parity; removed dead `cpTwoLine`. Display-only.
- **C30 (REQ-0078):** Invoice audit FKs/enrich/stamps; detail Record Audit; `db:backfill-invoice-audit`.
- **Verify:** **1058/1058** · tsc · lint · build PASS.

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

## Key paths

- CP list shells: `cp-clinical-list-table-classes.ts` · identity tokens `clinical-identity-inline-ui.ts`
- Entity detail: `EntityDetailPageShell`, `EntityDetailBackLink`, `EntityDetailFooterRow`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C31 shipped** (REQ-0079).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
