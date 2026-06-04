# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **Doctor detail:** `GET /api/doctors/[id]/snapshot` + `DoctorDetailScreenShared`; SSR `prefetchDoctorSnapshot` on `/doctors/[id]` + CP; `queryKeys.doctors.snapshot`.
- **Portal links:** `entity-detail-snapshot-links.ts` + `linkPolicy` on portal doctor detail — no title/patient 404s; doctor viewers → `/admins/:id` for admin owners; patient viewers → plain admin owners.
- **Invalidation:** `invalidateDoctorDetailAndSnapshot`; `appointment-invalidation-fk` + `invalidateDoctorsAffectedByPatientWrite` (patient primary doctor).
- **Routes:** `/admins/[id]` (removed `/staff/[id]`); `portalAdminDetailHref`. **Terminology:** portal clinician = doctor|admin on cards — `ClinicianInvoiceDialogShell`, `PortalClinicianLink`, `PortalAppointmentClinicianUser` (deprecated `Staff*` shims remain).
- **Doctor portal:** `InvoiceFormDialogProvider` mounts when layout `variant="doctor"` (auth hydrate-safe).
- **Verify:** `npm test` **711** / **133** files · tsc · lint · build.

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
| Appointment | `invalidateAfterAppointmentMutation` (+ FK `ownerId`/`treatingPhysicianId`) |
| Patient | `invalidateEntityAffectingAppointments` + `invalidateDoctorsAffectedByPatientWrite` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` (+ `appointments.all`) |
| Schedule | `invalidateDoctorSchedule` |
| Users | `invalidateUsersAndAuth` + `invalidateDoctorDetailAndSnapshot` |

Cross-tab: `query-cache-cross-tab.ts` in `QueryProvider`.

## Key paths

- Doctor: `doctor-snapshot-data.ts`, `doctor-detail/DoctorDetailScreenShared.tsx`, `useDoctorSnapshot.ts`, `entity-detail-snapshot-links.ts`
- Portal clinician UI: `ClinicianInvoiceDialogShell`, `PortalClinicianLink`, `portal-appointment-clinician.ts`, `appointment-card-clinician-image.ts`
- Cards: `AppointmentCard.tsx`, `AppointmentCategoryTypeMetaRow.tsx`, `portal-appointment-card-visibility.ts`
- Invoice: `invoice-dialog/`, `InvoiceFormDialogContext.tsx`
- SSR: `server-prefetch.ts`, `appointments-list-build.ts`, `portal-appointment.ts`

## Principle

Minimal typed diffs; shared libs; preserve SSR/cache/invalidation unless task requires change.
