# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-10)

- **C17 (REQ-0063):** `cpClinicalList*ColumnShellClass` tokens; admin Joined/Actions fixed (`min-w-[1080px]`); glass `cursor-pointer` global; VideoCall `triggerClassName` + `skyGlassBackButtonClass` on appointment detail.
- **C16 (REQ-0062):** user-admin violet glass; Phone column; `EntityEmailVerificationBadge`; `violetGlassTableFrameClass`.
- **C15–C14:** `EntityDetailPageShell` spacing; `EntityDetailBackLink`/`FooterRow`; tone glass backs.
- **Verify:** **930/930** · tsc · lint · build PASS.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Entity detail: `EntityDetailPageShell.tsx`, `EntityDetailBackLink.tsx`, `EntityDetailFooterRow.tsx`
- CP list columns: `cp-clinical-list-table-classes.ts`, `UserManagement.tsx`, `PatientManagement.tsx`
- Admin user: `admin-user-detail-ui-classes.ts`, `EntityEmailVerificationBadge.tsx`, `violet-glass-table-frame.ts`
- Glass actions: `calendar-header-action-styles.ts`, `ControlPanelGlassActionButton.tsx`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`
- Cancel: `appointment-cancel-access.ts`, `AppointmentActionsMenu`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md`. **C17 shipped** (REQ-0063); **930/930**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
