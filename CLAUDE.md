# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-05)

- **Visit fee UI:** `VisitFeeBadge` + `visit-fee-badge-ui-classes.ts` (`cardMeta`/`wizard`/`picker`/`table`/`services`) — height matches sibling type chip per surface. `resolveBookingVisitFeeDisplay` — booking steps 2–3 type price or doctor/default + `· est.`; `bookingWizardTypeBadgeClass` pairs sky type badge.
- **Fee display:** Euro icon only (no duplicate `€` text); `AppointmentCategoryTypeMetaRow`, portal cards, appt detail, patient booking, picker, services, doctor settings.
- **Record Audit:** `entity-detail-audit-actor.ts`; migrations `013`–`015`; CP admin `userDetailInclude`; `db:backfill-user-audit`.
- **Cache/SSR:** unchanged — display-only; booking types from `usePatientBookableAppointmentTypes` + `doctors.all` seed.
- **Verify:** **749** / **139** · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` on APIs; `rbac.ts`; `Link` internal.

## Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` (+ `appointmentId` → detail) |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Category | `invalidateCategoryDetailAndSnapshot` + `seedCategoryDetailCache` |
| User/doctor | `invalidateUsersAndAuth` + `invalidateDoctorDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Audit: `entity-detail-audit-actor.ts`, `EntityDetailAuditActorInline.tsx`, `EntityDetailRecordAuditCard.tsx`
- Includes: `patient-api-include.ts`, `category-api-include.ts`, `user-api-include.ts`, `appointment-access.ts`
- Appt: `appointment-detail-api.ts`, `appointment-detail-view-model.ts`, `useAppointmentDetail.ts`
- Visit fee: `VisitFeeBadge.tsx`, `visit-fee-badge-ui-classes.ts`, `appointment-visit-fee-display.ts`, `billing-visit-fee.ts`
- Booking: `PatientBookingDoctorVisitSummary`, `VisitTypePickerList`, `patient-booking-wizard.ts`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
