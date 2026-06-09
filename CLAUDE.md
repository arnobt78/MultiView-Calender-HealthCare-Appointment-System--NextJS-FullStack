# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-09)

- **C8.1 CP merged header:** SSR icon/title + client `ControlPanelChromeActions` registry in one sticky row (`ControlPanelSectionPageClient`); no `border-b` on CP chrome; prefetch/invalidation unchanged.
- **C9 portal chrome:** `portal-page-chrome-config.ts` + `PortalPageChrome`; patient/services/admin/insights/api headers; `EntityDetailChromeHeader` + `PortalDoctorChromeHeader` → `AppPageChrome` (`leading`/`aside` slots).
- **Dashboard:** toolbar-only `CalendarHeader` (no `portal-page-chrome` calendar key).
- **CP tabs:** `ControlPanelPageChrome` registers actions/toolbar; org + appointments_mgmt toolbar in header; invitation glass cards.
- **Verify:** **863/863** · tsc · lint · build PASS.
- **Invoice lifecycle TS:** `invoices.cancelled_at`, `payments.refunded_at` (`016_invoice_lifecycle_timestamps.sql`); PATCH cancel + refund route writes; `serializeInvoice` + list footer via `invoice-list-meta-status-dates.ts` (Paid / Refunded / Cancelled).
- **Dialog visit parity:** `invoice-dialog-visit-display.ts`; summary + picker — portrait, care tier, type+duration, `DoctorIdentityCell`; fee strip `buildInvoiceVisitFeeStripLine` on card + amount hint (create/edit).
- **Visit summary fees:** `invoice-visit-summary` + `billing-appointment-options-load` — fee + doctor display fields on summary/option rows.
- **SSR/prefetch/PDF:** `serializeInvoice` end-to-end — detail SSR, GET invoice, prefetch, `GET /api/invoices/[id]/pdf` (`refunded_at` on payment rows).
- **Invalidation:** unchanged — `invalidateAfterInvoiceWrite` → `invoices.*` + `billing.root`.
- **Doctor issuer UI:** `doctorCanMutateInvoice` + `viewerUserId` on portal list menu — Send/Edit/Delete only when `invoice.user_id` matches session doctor (API unchanged).
- **Billing list labels:** `InvoiceVisitDescriptionStack` — Patient / Treating / Owner prefix rows (doctor portal + CP list).
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

- Page chrome: `AppPageChrome.tsx`, `ControlPanelPageChrome.tsx`, `page-chrome-classes.ts`, `control-panel-page-chrome-config.ts`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop every prompt: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md` (24). **C8 active** (REQ-0038..0040); **863/863**.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
