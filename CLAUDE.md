# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-07)

- **Invoice detail UX:** plain visit title header; `{visit} · Invoice` section; `PaymentStatusBadge` + payment reference labels; `InvoiceStatusBadge` icons.
- **Agile V:** C6 REQ-0032; **780** / **146** · tsc · lint · build.

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
- Invoice: `PaymentStatusBadge`, `payment-status-display.ts`, `InvoiceDetailLiveBody` header title
- Cards: `AppointmentCard`, `PortalAppointmentTimelineCard`, `AppointmentDetailScreenShared`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
