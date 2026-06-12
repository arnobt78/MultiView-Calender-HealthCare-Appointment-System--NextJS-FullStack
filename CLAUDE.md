# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-12)

- **C25 (REQ-0069):** `findFilterOptionLabel` DRY (calendar + empty chips); `DoctorFilterSelect` + `userToDoctorIdentity`; services specialty/weekday presets.
- **C24 (REQ-0068):** Rich `FilterSelect` — `FilterSelectOptionLabel` + `filter-select-option-presets.ts`; ~12 enum filter call sites; org billing footer no `border-t`.
- **C23.1 (REQ-0067):** Org detail members filter row (`OrganizationDetailMembersSection`); client search/role filter.
- **C23 (REQ-0066):** Members header parity; `StaffUserIdentityCell`; doctor CP `doctorUsers` prefetch; doctor detail subtitle.
- **C22 (REQ-0065):** Org detail audit card; `{Org}'s Members` + role counts; member identity/actions.
- **Verify:** **1001/1001** · tsc · lint · build PASS.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Organization | `invalidateOrganizations` / `invalidateOrganizationDetail` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- **Filters (C24–C25):** `FilterSelect`, `FilterSelectOptionLabel`, `DoctorFilterSelect`, `filter-select-option-presets.ts`, `doctor-identity-map.ts`, `findFilterOptionLabel`
- **Org members (C23.1):** `OrganizationDetailMembersSection.tsx`, `organization-detail-members-filter.ts`
- **Org detail (C22–C23):** `OrganizationDetailScreen`, `organization-detail-members-columns.tsx`, `OrganizationMembersRoleCountInlineRow`, `StaffUserIdentityCell`
- **Org billing (C20):** `OrganizationBillingPanel.tsx`, `InvoicePortalListCard`
- **CP lists:** `cpClinicalListTableFrameClassName` + tone shells (`sky`/`violet`/`indigo`/`emerald`)
- Entity detail: `EntityDetailPageShell`, `EntityDetailBackLink`, `EntityDetailFooterRow`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C25 shipped** (REQ-0069).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
