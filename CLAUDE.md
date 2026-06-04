# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **Portal entity detail links:** `resolvePortalEntityDetailSnapshotLinkPolicy` on portal `/doctors/[id]` + `/categories/[id]` — patient: plain title/patient/admin owner; doctor owners linked; doctor viewer: `/admins/:id` for admin owners. CP = full links.
- **Doctor snapshot:** `GET /api/doctors/[id]/snapshot`, `prefetchDoctorSnapshot`, `invalidateDoctorDetailAndSnapshot`, FK invalidation + patient→doctor snapshot.
- **Routes:** `/admins/[id]`; clinician UI (`ClinicianInvoiceDialogShell`, `PortalClinicianLink`, …); deprecated `Staff*` shims.
- **Verify:** **712** tests / **133** files · tsc · lint · build.

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
| Appointment | `invalidateAfterAppointmentMutation` (+ FK ids) |
| Patient | `invalidateEntityAffectingAppointments` + `invalidateDoctorsAffectedByPatientWrite` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types | `invalidateAppointmentTypeDerived` (+ `appointments.all`) |
| Users | `invalidateUsersAndAuth` + `invalidateDoctorDetailAndSnapshot` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Links: `entity-detail-snapshot-links.ts`, `patient-detail-snapshot-columns.tsx`
- Doctor/category detail: `DoctorDetailScreenShared.tsx`, `CategoryDetailScreenShared.tsx`, `doctor-snapshot-data.ts`
- Clinician cards: `PortalClinicianLink`, `portal-appointment-clinician.ts`, `appointment-card-clinician-image.ts`
- Invoice: `ClinicianInvoiceDialogShell`, `InvoiceFormDialogContext.tsx`

## Principle

Minimal typed diffs; shared libs; preserve SSR/cache/invalidation unless task requires change.
