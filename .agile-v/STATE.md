# Agile V — Living State

<!-- Updated: 2026-06-12 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C24** — rich filter dropdown options |
| **Phase** | Orchestrate → Verify |
| **Stage** | 3 |
| **Status** | verify PASS |
| **Last Updated** | 2026-06-12 |
| **Parent REQ** | REQ-0068 |
| **HEAD** | `24aa910` |

## Verify baseline (C24 close)

**997/997** (200 files) · tsc · lint · build — PASS

## C24 scope

- `FilterSelectOptionLabel` + rich `FilterSelect` (per-option icon + text color).
- `filter-select-option-presets.ts` — role, invoice, active, verification, photo, care tier, calendar, specialty, org filters.
- Migrated ~12 enum FilterSelect call sites; org billing footer `border-t` removed.

## Verify baseline (C23.1 close)

**990/990** (199 files) · tsc · lint · build — PASS

## C23.1 scope

- `OrganizationDetailMembersSection` — `ClinicalListFilterToolbar` + role `FilterSelect` above members table.
- `filterOrganizationDetailMembers` client-side search/role filter; header counts stay full roster.

## C23 scope

- Members header: `PortalPanelSubsectionHeader` + `OrganizationMembersRoleCountInlineRow` + subtitle.
- Identity parity: `StaffUserIdentityCell`; patient `tableBadgePlacement=belowEmail` h-7.
- Doctor tab section prefetch seeds `doctorUsers`; CP assigned patients stacked header.

## C22 scope

- `EntityDetailRecordAuditCard` + org audit schema (`updated_at`, `created_by`/`updated_by`).
- Rich owner `EntityDetailAuditActorInline`; `formatOrganizationTypeLabel`.
- `{Org}'s Members` heading + role count summary; `cpClinicalListTableFrameClassName`.
- Member identity: `DoctorIdentityRow` / `PatientIdentityCell` / admin avatar row; `OrganizationMemberRowActions` ⋮.

## C21 scope

- `OrganizationDialogHeader` white header + DialogClose.
- Rich indigo user/role pickers; role auto-fill from `user.role`.
- Create org optional initial admin/doctor/patient members; API `$transaction`.

## C20 scope

- `PortalPanelSection` + `organizationBillingPanelClass` — possessive title, numeric count, `InvoiceStatusCountInlineRow`.
- Compact + full: `ClinicalListFilterToolbar` + status filter above list.
- `formatPortalInvoiceListLabel` — `Invoice N: #shortId` on doctor + org portal list cards.
- `organization-billing-display.ts` title/subtitle helpers.

## C19 scope

- `indigoGlassTableFrameClass` — patient/violet table shell parity.
- Columns: `EntityTitleLink`, `UserRoleBadge`, `OrganizationMembersRoleBadges`, muted typography, amber outstanding.
- Billing filter width; vertical `EllipsisVertical` actions menu.
- Demo seed: `test@patient.com` as org member role `patient`.

## C18.2 scope (shipped)

- `useOrganizationDetail` hook; `organization-detail-client.ts`; enriched POST members.
