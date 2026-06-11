# Agile V — Living State

<!-- Updated: 2026-06-11 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C22** — org detail UI parity |
| **Phase** | Verify |
| **Stage** | 4 |
| **Status** | verify PASS |
| **Last Updated** | 2026-06-11 |
| **Parent REQ** | REQ-0065 |

## Verify baseline (C22 close)

**975/975** (195 files) · tsc · lint · build — PASS

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
