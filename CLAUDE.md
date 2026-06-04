# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **Appt detail:** `appointment-detail-api.ts` → GET/PATCH/PUT `{ appointment, detail }`; SSR `prefetchAppointmentDetailViewModel`; `useAppointmentDetail` refetch; `patchAppointmentDetailCache` + optimistic PATCH/toggle; `invalidateAfterAppointmentMutation` → `appointments.detail`.
- **Appt UI:** `AppointmentDetailScreenShared` + footer `AppointmentDetailActionBar` (sky/violet); no dead `raw` props.
- **Invoice detail:** `InvoiceDetailActionBar` footer; `resolveInvoiceDetailActionCapabilities`; linked visit `linkPolicy` + owner roles on summary.
- **Portal links:** `resolvePortalEntityDetailSnapshotLinkPolicy` on `/doctors/[id]`, `/categories/[id]`, invoice visit panel.
- **Verify:** **724** / **136** · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` on APIs; `rbac.ts`; `Link` internal.

## Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` (+ FK, `appointmentId` → detail) |
| Patient | `invalidateEntityAffectingAppointments` + `invalidateDoctorsAffectedByPatientWrite` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types | `invalidateAppointmentTypeDerived` |
| Users | `invalidateUsersAndAuth` + `invalidateDoctorDetailAndSnapshot` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Appt: `appointment-detail-api.ts`, `appointment-detail-cache.ts`, `useAppointmentDetail.ts`, `appointment-detail/`
- Invoice: `InvoiceDetailActionBar.tsx`, `invoice-detail-action-capabilities.ts`
- Links: `entity-detail-snapshot-links.ts`
- Entity detail: `DoctorDetailScreenShared`, `CategoryDetailScreenShared`, `doctor-snapshot-data.ts`
- Invoice shell: `InvoiceFormDialogContext.tsx`, `ClinicianInvoiceDialogShell`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
