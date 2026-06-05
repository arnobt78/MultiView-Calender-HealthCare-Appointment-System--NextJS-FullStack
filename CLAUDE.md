# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-05)

- **Invoice violet detail:** `invoice-detail-ui-classes.ts` purple shadow/icons; `InvoiceLinkedVisitPanel` Visit row flex+`AppointmentTypeGlassBadge`; `InvoiceDetailHeaderActions` (Generate draft→sent, Download PDF); `api/invoices/[id]/pdf` + `invoice-pdf-document.ts` (`force-dynamic`, `assertInvoiceAccess`).
- **Identity + chrome:** `clinical-identity-inline-ui.ts`; `EntityDetailChromeHeader` on appt/invoice/doctor/category/**CP patient**; `entityDetailDefinitionIdentityRowClass`.
- **Invalidation:** Generate reuses `updateInvoice` → `invalidateAfterInvoiceWrite` / `invalidateInvoicesAndOverview` (no new keys).
- **Verify:** **764** / **144** · tsc · lint · build.

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
| Category | `invalidateCategoryDetailAndSnapshot` |
| User/doctor | `invalidateUsersAndAuth` + `invalidateDoctorDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Invoice: `InvoiceDetailLiveBody`, `InvoiceDetailHeaderActions`, `InvoiceLinkedVisitPanel`, `invoice-pdf-document.ts`, `invoice-detail-ui-classes.ts`
- Chrome/identity: `EntityDetailChromeHeader`, `clinical-identity-inline-ui.ts`, `PatientIdentityCell`, `page-chrome-classes.ts`
- Appt/audit: `appointment-detail-view-model.ts`, `entity-detail-audit-actor.ts`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
