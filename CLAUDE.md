# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-11)

- **C20 (REQ-0065):** Org billing `PortalPanelSection`; possessive title + status inline; filters compact+full; `Invoice N: #id`; Category label; portal density py; card `overflow-hidden`.
- **C19.1:** Detail members `UserRoleBadge`; `db:seed-org-portal-patient-member`.
- **C19 (REQ-0064):** Org list — `indigoGlassTableFrameClass`; `EntityTitleLink`/`UserRoleBadge`/`OrganizationMembersRoleBadges`.
- **Verify:** **966/966** · tsc · lint · build PASS.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` (+ `getOrganizationIdFromInvoiceCache`) |
| Organization | `invalidateOrganizations` / `invalidateOrganizationDetail` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts` (`ORGANIZATIONS`, `INVOICES_BILLING` on org detail).

## Key paths

- **Org list (C19):** `OrganizationManagement.tsx`, `organization-management-columns.tsx`, `OrganizationMembersRoleBadges.tsx`, `indigoGlassTableFrameClass`
- **Org billing (C20):** `OrganizationBillingPanel.tsx`, `organization-billing-display.ts`, `InvoicePortalListCard` (portal density), `InvoiceVisitDescriptionStack`
- **Org detail (C18.2):** `useOrganizationDetail`, `organization-detail-load.ts`, `organization-detail-client.ts`, `organization-dialog/`
- **CP lists:** `cpClinicalListTableFrameClassName` + tone shells (`sky`/`violet`/`indigo`/`emerald`)
- Entity detail: `EntityDetailPageShell.tsx`, `EntityDetailBackLink.tsx`, `EntityDetailFooterRow.tsx`
- Invoice: `InvoicePortalListCard.tsx`, `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C20 shipped** (REQ-0065).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
