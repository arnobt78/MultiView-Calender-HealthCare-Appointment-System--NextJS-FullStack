# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-11)

- **C19 (REQ-0064):** Org list UI — `indigoGlassTableFrameClass`; `EntityTitleLink`/`UserRoleBadge`/`OrganizationMembersRoleBadges`; billing filter width; vertical actions menu; demo `test@patient.com` org member.
- **C18.2 (REQ-0065):** `useOrganizationDetail`; `organization-detail-client.ts` cache merges; enriched POST members; `prefetchOrganizationDetail` in detail page.
- **Verify:** **961/961** · tsc · lint · build PASS.

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
- **Org detail (C18.2):** `useOrganizationDetail`, `organization-detail-load.ts`, `organization-detail-client.ts`, `OrganizationDetailScreen.tsx`, `organization-dialog/`
- **CP lists:** `cpClinicalListTableFrameClassName` + tone shells (`sky`/`violet`/`indigo`/`emerald`)
- Entity detail: `EntityDetailPageShell.tsx`, `EntityDetailBackLink.tsx`, `EntityDetailFooterRow.tsx`
- Invoice: `InvoicePortalListCard.tsx`, `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C19 shipped** (REQ-0064/0065).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
