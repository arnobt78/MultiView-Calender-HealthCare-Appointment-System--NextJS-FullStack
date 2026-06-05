# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-05)

- **Visit location:** `appointment-visit-location.ts` + `AppointmentVisitScheduleMeta`; booking persists `office_location`; portal includes `office_location`; cards/detail/timeline/compact show place + `TelehealthSessionBadge`.
- **Invoice billing violet:** detail/dialog/list; header Generate/Download; footer Send deduped; PDF `?download=1`.
- **Invalidation:** booking → `invalidateAfterAppointmentMutation`; invoice → `invalidateAfterInvoiceWrite`.
- **Verify:** **771** / **145** · tsc · lint · build.

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

- Location: `appointment-visit-location.ts`, `AppointmentVisitScheduleMeta`, `portal-appointment-prisma-include.ts`
- Booking: `PatientBookingDoctorVisitSummary`, `patient-portal/route.ts` POST
- Invoice: `InvoiceDetailHeaderActions`, `invoice-pdf-document.ts`
- Cards: `AppointmentCard`, `PortalAppointmentTimelineCard`, `AppointmentDetailScreenShared`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
