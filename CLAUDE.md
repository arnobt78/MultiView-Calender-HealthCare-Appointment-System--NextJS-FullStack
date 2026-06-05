# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-05)

- **Identity parity:** `clinical-identity-inline-ui.ts` tokens; `PatientIdentityCell` inline (badge row, compact care tier); `entityDetailDefinitionIdentityRowClass`; appointment Related People + invoice linked visit `identity` rows.
- **Invoice detail:** `EntityDetailChromeHeader` + `Receipt` tile; `mapInvoiceIssuerActor` + `buildInvoiceDetailAuditExtraRows`; visit type/duration; `ClinicalDataTable` payment cols; `invoiceDetailTableFrameClass` glow; SSR `attachInvoiceIssuerLabels` in `invoice-detail-ssr` + `prefetchInvoiceDetail`; `patient_clinical_profile` on visit summary.
- **Entity chrome:** `EntityDetailChromeHeader` on appt/invoice/doctor/category detail — `pageChromeHeaderShellClass` border-b + tone icon tiles (`page-chrome-classes.ts`).
- **Visit fee:** `VisitFeeBadge` sizes + `AppointmentListVisitFeeBadge`; portal list rows; `resolveBookingVisitFeeDisplay`.
- **Record Audit:** `entity-detail-audit-actor.ts`; migrations `013`–`015`; `db:backfill-user-audit`.
- **Verify:** **760** / **143** · tsc · lint · build.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()`; `dynamic = "force-dynamic"` on APIs; `rbac.ts`; `Link` internal.

## Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` (+ `appointmentId` → detail) |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Category | `invalidateCategoryDetailAndSnapshot` + `seedCategoryDetailCache` |
| User/doctor | `invalidateUsersAndAuth` + `invalidateDoctorDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Identity: `clinical-identity-inline-ui.ts`, `PatientIdentityCell`, `DoctorIdentityRow`, `entityDetailDefinitionIdentityRowClass`
- Chrome: `EntityDetailChromeHeader.tsx`, `page-chrome-classes.ts` (tone icon tiles)
- Invoice detail: `InvoiceDetailLiveBody`, `InvoiceLinkedVisitPanel`, `invoice-payment-history-columns.tsx`, `appointment-detail-invoice-audit-rows.tsx`
- Audit: `entity-detail-audit-actor.ts`, `EntityDetailRecordAuditCard.tsx`
- Appt: `appointment-detail-view-model.ts`, `useAppointmentDetail.ts`
- Visit fee: `VisitFeeBadge.tsx`, `AppointmentListVisitFeeBadge.tsx`, `appointment-visit-fee-display.ts`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
