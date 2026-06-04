# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-04)

- **Record Audit (entity detail):** `EntityDetailAuditActorInline` + `entity-detail-audit-actor.ts` (`mapPatient/Category/User` + appt `auditCreatedBy` from Prisma includes). Card: Created / Last updated / Invoice issued (appt) — timestamp · avatar · email · role badge.
- **DB audit FKs:** `appointments` + `users` `created_by`/`updated_by`; migrations `013`–`015`; seeds backfill demo admin. Category/patient already had FKs; `categoryAuditUserPick` / `patientAuditUserPick` / `userDetailInclude`.
- **Appt detail:** `formatAppointmentDetailWhenRange` live subtitle; `appointment-detail-invoice-audit-rows.tsx`; `issuer_email`/`issuer_role` on invoices; PATCH/POST set `updated_by_id`.
- **Cache:** `setQueryData` on patient/category/user PUT; `useCategory`/`useUser` SSR `initialData` + `refetchOnMount: false`; appt `invalidateAfterAppointmentMutation` + detail API payload.
- **UI polish:** Visit Overview title; People inline rows; `InvoiceVisitDescriptionStack`; primary doctor SSR pick.
- **CP admin user:** `/control-panel/users/[id]` — `AdminUserDetailScreen` + `userDetailInclude` (Record Audit parity).
- **DB ops:** `db:backfill-user-audit` (`scripts/backfill-user-audit.ts`); seed-test-user stamps + backfills null `created_by_id`.
- **Verify:** **742** / **138** · tsc · lint · build. DB: `prisma:push` → `db:backfill-user-audit` (0/0 = already stamped).

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

- Audit: `entity-detail-audit-actor.ts`, `EntityDetailAuditActorInline.tsx`, `EntityDetailRecordAuditCard.tsx`
- Includes: `patient-api-include.ts`, `category-api-include.ts`, `user-api-include.ts`, `appointment-access.ts`
- Appt: `appointment-detail-api.ts`, `appointment-detail-view-model.ts`, `useAppointmentDetail.ts`
- Detail screens: appt/patient/category/doctor/`AdminUserDetailScreen`; backfill: `scripts/backfill-user-audit.ts`

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
