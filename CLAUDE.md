# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-07)

- **REQ-0033:** Badge `font-normal` everywhere (badges + filter/toggle pills). `EntityIdCopyInline` on detail IDs, invoice header, payment ID, org members, **invoice list `#shortId` + link** (`InvoiceNumberTableCell`). `labelNode` for link+ copy tables.
- **REQ-0032:** Invoice detail plain title; `PaymentStatusBadge`; payment reference labels; status icons.
- **Verify:** **786** / **148** · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

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

- ID copy: `EntityIdCopyInline` (`labelNode` for tables), `InvoiceNumberTableCell`, `useCopyToClipboard`, `entity-id-display`
- Invoice: `InvoiceDetailLiveBody`, `PaymentStatusBadge`, `payment-status-display.ts`, `invoice-payment-history-columns.tsx`
- Location: `appointment-visit-location.ts`, `DashboardQueueAppointmentRow`
- Cards: `AppointmentCard`, `PortalAppointmentTimelineCard`, `AppointmentDetailScreenShared`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
