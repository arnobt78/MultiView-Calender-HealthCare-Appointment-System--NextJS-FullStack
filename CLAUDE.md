# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **Appointment cards:** `AppointmentCategoryTypeMetaRow` — category + visit type + duration + fee (+ time on list); `APPOINTMENT_TYPE_CARD_SELECT` on calendar/portal APIs + SSR; type-only row when no `category_data`.
- **Staff portraits:** `resolvePrimaryDoctorCardImage` (patient `primary_doctor_image`, portal owner/treating, directory); `patientPrimaryDoctorPick` on `prefetchPatients` + `GET /api/patients`.
- **Notes RBAC:** `canShowAppointmentClinicalNotes` — `AppointmentCard` + `PortalAppointmentTimelineCard` (admin/doctor only).
- **Invalidation:** `invalidateAppointmentTypeDerived` also busts `appointments.all` (type name/fee on cached cards).
- **Portal staff rows:** inline `MetaIdentityBlock` + `PortalAppointmentStaffIdentityBlock` (one row).
- **Invoices (prior):** `loadInvoicesListForViewer`, Stripe checkout copy/session track, visit physician images on summaries.
- **Verify:** `npm test` **693** / **130** files · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` on APIs; `rbac.ts`; `Link` internal.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient/category | `invalidateEntityAffectingAppointments` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` (+ `appointments.all`) |
| Schedule | `invalidateDoctorSchedule` |
| Users | `invalidateUsersAndAuth` |

Cross-tab: `query-cache-cross-tab.ts` in `QueryProvider`.

## Key paths

- Cards: `AppointmentCard.tsx`, `appointment-display/AppointmentCategoryTypeMetaRow.tsx`, `appointment-type-include.ts`, `appointment-card-staff-image.ts`, `portal-appointment-card-visibility.ts`
- Invoice: `invoice-dialog/`, `invoice-visit-meta-line.ts`, `invoices-list-response.ts`
- SSR: `server-prefetch.ts`, `appointments-list-build.ts`, `portal-appointment.ts`
- Seeds: `seed-demo-full.ts`, `doctor-profile-seed-data.ts`

## Principle

Minimal typed diffs; shared libs; preserve SSR/cache/invalidation unless task requires change.
