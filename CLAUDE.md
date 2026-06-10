# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-10)

- **C13 user-admin parity:** `UserManagement` — `PatientStatCard` stats, filter toolbar (status/verification/photo), Status column, slate glass frame; emerald `AdminUserFormDialog` (Doctor parity); detail owned-appointments table + glass back.
- **C13 chrome nav fix:** live header slots in `ControlPanelChromeRegistryProvider` (not module singleton — old route unmount reset no longer wipes new tab actions).
- **C12.3:** refresh notify; overview/notifications dynamic subtitle; header transparent blur.
- **Verify:** **913/913** · tsc · lint · build PASS.
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

- Page chrome: `control-panel-chrome-sync-store.ts`, `UserManagement.tsx`, `AdminUserFormDialog.tsx`, `admin-user-owned-appointments.ts`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop every prompt: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md` (24). **C13** (REQ-0059); **913/913**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
