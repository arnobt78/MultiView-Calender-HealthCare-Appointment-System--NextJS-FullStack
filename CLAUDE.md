# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-11)

- **C21 (REQ-0065):** Org dialogs — rich pickers, role auto-fill, `initialMembers` API; `OrganizationDialogPickerSearchInput`; `organizationDialogPickerScrollClass` (no stable gutter).
- **C20 (REQ-0065):** Org billing `PortalPanelSection`; possessive title + status inline; filters compact+full; `Invoice N: #id`; Category label; portal density py.
- **C19.1:** Detail members `UserRoleBadge`; `db:seed-org-portal-patient-member`.
- **C19 (REQ-0064):** Org list — `indigoGlassTableFrameClass`; `EntityTitleLink`/`UserRoleBadge`/`OrganizationMembersRoleBadges`.
- **Verify:** **970/970** · tsc · lint · build PASS.

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
- **Org dialogs (C21):** `organization-dialog/*`, `organization-member-role.ts`, `StaffAppointmentPickerField` indigo tone
- **Org billing (C20):** `OrganizationBillingPanel.tsx`, `organization-billing-display.ts`, `InvoicePortalListCard`
- **Org detail (C18.2):** `useOrganizationDetail`, `organization-detail-load.ts`, `organization-detail-client.ts`, `organization-dialog/`
- **CP lists:** `cpClinicalListTableFrameClassName` + tone shells (`sky`/`violet`/`indigo`/`emerald`)
- Entity detail: `EntityDetailPageShell.tsx`, `EntityDetailBackLink.tsx`, `EntityDetailFooterRow.tsx`
- Invoice: `InvoicePortalListCard.tsx`, `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C21 shipped** (REQ-0065).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
