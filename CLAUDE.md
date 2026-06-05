# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-05)

- **Visit location:** shared resolver on portal/cards/detail/doctor portal/dashboard queue + patient snapshot table; `appointmentSnapshotInclude` office embed; `resolveSnapshotAppointmentDisplayLocation`.
- **Invoice billing violet:** detail/dialog/list; header Generate/Download; footer Send deduped; PDF `?download=1`.
- **Invalidation:** booking → `invalidateAfterAppointmentMutation`; invoice → `invalidateAfterInvoiceWrite`.
- **Verify:** **772** / **145** · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` on APIs; `rbac.ts`; `Link` internal.

## Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Location: `appointment-visit-location.ts`, `doctorPortalAppointmentListInclude`, `mapDoctorPortalAppointmentsFromRows`, `DashboardQueueAppointmentRow`
- Booking: `PatientBookingDoctorVisitSummary`, `patient-portal/route.ts` POST
- Invoice: `InvoiceDetailHeaderActions`, `invoice-pdf-document.ts`
- Cards: `AppointmentCard`, `PortalAppointmentTimelineCard`, `AppointmentDetailScreenShared`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
