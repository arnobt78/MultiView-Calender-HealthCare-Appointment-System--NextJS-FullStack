# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-02)

- **Appointment type pricing:** `price_cents` added to `appointment_types` DB + Prisma schema (migration `012`). All API routes (`/global`, `/[id]`, `/route`, `/catalog`, `/admin-all`) expose and accept it. Auto-draft falls back: `appointment_type.price_cents` → `doctor.consultation_fee`.
- **Price visible everywhere:** Price badge in `VisitTypePickerList` (booking dialogs), `AppointmentCard` (all portals/dashboard), `GlobalAppointmentTypesEditor`. `appointment_type_price_cents` threaded through all `serializeAppointment` call sites — portals, SSR prefetch, batch `?ids=`, snapshot rows.
- **Appointment Types page overhaul:** Renamed from "Global Visit Types". Two sections: Global (A-Z) + Custom by Doctor (A-Z). Stats row (Total/Global/Custom/With Pricing). Price field in create/edit forms. New `GET /api/appointment-types/admin-all` (admin-only, returns all types with owner info).
- **Doctor profiles enriched:** All fields seeded (specialty, bio, phone, license #, department, office, fee, experience, languages). `DoctorDetailScreen` shows all. `PatientDetailScreen` doctor card shows all. `StaffDirectoryEntry` extended.
- **CP page consistency:** `InvoiceManagement` + `AppointmentsManagement` + `OrganizationManagement` have `PageHeader`. Invoice page adds Draft stat card. Org page adds stats row.
- **Auto-draft enhanced:** `resolveVisitFeeCents` in `billing-visit-fee.ts`. `notifyPatientDraftInvoiceCreated` in `billing-notify-patient.ts` emails patient on auto-draft.
- **Portal compact rows:** Emerald price badge added to `PortalAppointmentTimelineCard` (patient), `DoctorPortalAppointmentListRow` (doctor today/upcoming), `RecentAppointmentRow` in `AdminPortalPage`. Data was already flowing via `serializeAppointment`; only rendering was missing.
- **Seed:** `db:seed-extended` sets `price_cents` on 4 global types (Initial €150, Follow-up €92.50, Telehealth €85, Annual €120) + full doctor profiles.
- **Verify:** `npm test` **600** / **106** files, tsc 0 errors, lint clean, build ✓.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()` APIs; `dynamic = "force-dynamic"` new APIs; RBAC `rbac.ts`; `Link` internal; native checkbox.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient/category | `invalidateEntityAffectingAppointments` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` (busts `invoices.all` prefix incl. `byOrganization` + `byOrganizationTotals`) |
| Types/config | `invalidateAppointmentTypeDerived` |
| Schedule | `invalidateDoctorSchedule` |
| Users | `invalidateUsersAndAuth` |

Cross-tab: `query-cache-cross-tab.ts` in `QueryProvider`.

## Key paths

- Scope: `staff-appointment-calendar-scope.ts`, `insights/insights-aggregate.ts`, `invoices-revenue-scope.ts`
- Query: `query-keys.ts`, `query-client.ts`, `server-prefetch.ts`
- Auth: `proxy.ts`, `session.ts`
- Billing: `invoice-billing-totals.ts`, `billing-auto-draft.ts`, `billing-visit-fee.ts`, `billing-notify.ts`, `org-billing-prefetch.ts`, `components/shared/billing/*`
- Appointment types: `doctor-bookable-types.ts`, `doctor-directory.ts`, `appointment-snapshot-row.ts`, `api/appointment-types/admin-all/route.ts`
- Seed: `scripts/seed-demo-appointments-curated.ts`, `scripts/seed-extended-schema.ts`

## Follow-ups (optional, not blocking)

`calendar/export`, `calendar/sync`, `appointments/search` = owner-only. Assignee-only = assignee batch. `?ids=` batch = no treating OR (main list has treating). Fix export/search if QA requires treating-only in those tools.

## Principle

Minimal typed diffs; shared abstractions; preserve cache/SSR/invalidation unless task requires change.
