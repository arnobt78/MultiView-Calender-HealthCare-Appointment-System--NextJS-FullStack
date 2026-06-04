# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **C4 invoice UI:** CP `InvoiceManagement` DataTable + amber filters/columns (`invoice-table-cells`); `InvoiceVisitDirectoryPickerCard`; `ClinicalGlassDatePicker` (due align end); glass `InvoiceDetailLiveBody`; `DEFAULT_DOCTOR_VISIT_FEE_CENTS` (15000); doctor portal list reuses table cells.
- **Visit meta:** `invoice-visit-meta-line.ts` + `InvoiceVisitMetaLine` (picker text + summary icons); `InvoiceVisitListMeta` wrapper.
- **Seeds:** `db:seed-demo-full`, `db:seed-doctor-profiles`, `db:check-demo-seed`; `scripts/lib/doctor-profile-seed-data.ts`. Roles: **admin | doctor | patient** only (`rbac.isStaffRole`).
- **Appt dialog:** location prefill from doctor `office_location` when empty + hint.
- **Verify:** `npm test` **674** / **122** files · tsc · lint · build.

## Prior (2026-06-02)

- Invoice dialog/shell, `useInvoiceFormDialog`, detail live edit, SSE hardening, calendar invoice badge (`useAppointmentInvoiceDisplayMap`), `invalidateAfterInvoiceWrite` → `invoices.*` + `billing.*`.

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
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient/category | `invalidateEntityAffectingAppointments` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` |
| Schedule | `invalidateDoctorSchedule` |
| Users | `invalidateUsersAndAuth` |

Cross-tab: `query-cache-cross-tab.ts` in `QueryProvider`.

## Key paths

- Invoice: `invoice-dialog/`, `InvoiceFormDialogContext`, `invoice-visit-meta-line.ts`, `invoice-management-columns.tsx`
- Billing: `billing-visit-fee.ts`, `billing-appointment-options-load.ts`, `invoice-billing-totals.ts`
- SSR: `server-prefetch.ts`, `control-panel-section-prefetch.ts`, `org-billing-prefetch.ts`
- Seeds: `seed-demo-full.ts`, `doctor-profile-seed-data.ts`

## Principle

Minimal typed diffs; shared libs; preserve SSR/cache/invalidation unless task requires change.
