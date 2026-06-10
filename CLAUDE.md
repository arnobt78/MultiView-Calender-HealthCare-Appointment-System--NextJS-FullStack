# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-10)

- **C15 detail spacing (REQ-0061):** `EntityDetailPageShell` — header flush; body `space-y-3`; org members `ClinicalDataTable`; org list SSR seed on detail route.
- **C14 entity detail parity (REQ-0060):** `EntityDetailBackLink` + `EntityDetailFooterRow`; no header `border-b`; tone glass backs (emerald/slate/indigo/violet); appointment single footer; org detail refactor.
- **C13 chrome nav fix:** provider `key={tab}`; deleted legacy sync store.
- **Verify:** **916/916** · tsc · lint · build PASS.
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

- Entity detail: `EntityDetailPageShell.tsx`, `EntityDetailBackLink.tsx`, `EntityDetailFooterRow.tsx`, `section-page-layout.ts`
- Org detail: `OrganizationDetailScreen.tsx`, `organization-detail-members-columns.tsx`, `organization-detail-ui-classes.ts`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop every prompt: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md` (24). **C15** (REQ-0061); **916/916**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
