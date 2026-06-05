# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-05)

- **Invoice billing violet:** detail + dialog + management list share violet tokens (`invoice-detail-ui-classes.ts`, `invoice-dialog-ui-classes.ts`).
- **Detail actions:** header Generate/Download; footer Send deduped via `resolveInvoiceDetailSendInFooter`; PDF `?download=1` attachment (`downloadInvoicePdf`).
- **Identity + chrome:** `clinical-identity-inline-ui.ts`; `EntityDetailChromeHeader` on appt/invoice/doctor/category/CP patient.
- **Invalidation:** Generate → `updateInvoice` → `invalidateAfterInvoiceWrite`.
- **Verify:** **767** / **144** · tsc · lint · build.

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

- Invoice: `InvoiceDetailHeaderActions`, `InvoiceDetailActionBar`, `invoice-pdf-document.ts`, `invoice-detail-action-capabilities.ts`, `api/invoices/[id]/pdf`
- Dialog: `invoice-dialog-ui-classes.ts`, `InvoiceFormDialog`
- Chrome/identity: `EntityDetailChromeHeader`, `clinical-identity-inline-ui.ts`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
