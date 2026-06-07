# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-07)

- **Services catalog:** DB `icon`/`color` → API + SSR prefetch; `AppointmentTypeBrandMark` light-tint tiles; per-hue card glow; `ServicesCatalogTypeSelect` filters doctor grid + Appointment Services row (`filterServiceCatalog`).
- **REQ-0033:** Badge `font-normal`; `EntityIdCopyInline`; dynamic visit-fee disclaimer (`VisitFeeInfoNoteCard`).
- **Verify:** **800** / **150** · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs + auth SSR pages; `rbac.ts`; `Link` internal.

## Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment type | `invalidateAppointmentTypeDerived` → `appointmentTypes.*` incl. `catalog` |
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Services catalog: `appointment-service-catalog.ts`, `service-catalog-visual.ts`, `AppointmentTypeBrandMark`, `ServiceCatalogCard`, `ServicesCatalogTypeSelect`, `prefetchAppointmentServiceCatalog`
- ID copy: `EntityIdCopyInline`, `useCopyToClipboard`
- Visit fee copy: `appointment-visit-fee-display.ts`, `VisitFeeInfoNoteCard.tsx`
- Invoice: `InvoiceDetailLiveBody`, `PaymentStatusBadge`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
