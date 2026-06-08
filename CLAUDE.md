# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **Invoice lifecycle TS:** `invoices.cancelled_at`, `payments.refunded_at` (`016_invoice_lifecycle_timestamps.sql`); PATCH cancel + refund route writes; `serializeInvoice` + list footer via `invoice-list-meta-status-dates.ts` (Paid / Refunded / Cancelled).
- **Dialog visit parity:** `invoice-dialog-visit-display.ts`; summary + picker — portrait, care tier, type+duration, `DoctorIdentityCell`; fee strip `buildInvoiceVisitFeeStripLine` on card + amount hint (create/edit).
- **Visit summary fees:** `invoice-visit-summary` + `billing-appointment-options-load` — fee + doctor display fields on summary/option rows.
- **SSR/prefetch:** `serializeInvoice` end-to-end — `invoice-detail-ssr`, `GET /api/invoices/[id]`, `server-prefetch` (lifecycle TS on first paint).
- **Invalidation:** unchanged — `invalidateAfterInvoiceWrite` → `invoices.*` + `billing.root`.
- **Doctor issuer UI:** `doctorCanMutateInvoice` + `viewerUserId` on portal list menu — Send/Edit/Delete only when `invoice.user_id` matches session doctor (API unchanged).
- **Billing list labels:** `InvoiceVisitDescriptionStack` — Patient / Treating / Owner prefix rows (doctor portal + CP list).
- **Verify:** **862** / **166** · `npm test && tsc && lint && build`.

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

- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
