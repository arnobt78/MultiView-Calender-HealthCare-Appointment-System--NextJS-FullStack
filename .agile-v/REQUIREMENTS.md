# Requirements — HealthCal Pro

<!-- Revision: C1+C2+C3 | C1/C2 archived | C3 active | Last updated: 2026-06-02 -->

## Document Control

| Field | Value |
|-------|-------|
| Cycle | C1 (archived) + C2 (archived) + C3 (active) |
| Author | Requirement Architect |
| Gate 1 status | C1 GATE-0001 · C2 GATE-0003 approved |
| Canonical source | this file |

## Requirements

### REQ-0001 — CP category-management parity + active/inactive booking selects

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |

**Statement:** As an admin, I need category management to match patient-management UX (SSR prefetch, stats, filters, table, violet glass CRUD dialog, detail footer) and booking dropdowns to filter inactive entities so scheduling stays accurate.

**Acceptance criteria:**
1. `/control-panel/category-management` SSR-prefetches categories; sidebar persists; only table/stat values pulse on load.
2. List supports create/edit/delete via glass dialog and row ⋮ menu; detail page has Update/Delete footer (no broken `?mode=edit`).
3. Booking `<Select>` for patients/categories: active selectable; inactive shown disabled at bottom with separator; edit preserves current inactive selection.
4. Lists/tables/calendar filters still show all categories/patients including inactive.
5. CRUD invalidates cache everywhere without page refresh (`invalidateEntityAffectingAppointments("categories")`).

**Constraints:**
- `queryKeys` from `query-keys.ts`; no hardcoded keys.
- `export const dynamic = "force-dynamic"` on affected routes.
- Violet glass dialog; amber stats/table frame (not sky/emerald).
- Work on `main` only; do not delete existing files.

**Out of scope:**
- Calendar `Filters.tsx` active filtering.
- Patient booking wizard category select.
- New branches or summary `.md` docs.

## Traceability Index

| REQ-ID | Status | Linked CR | ART-IDs | VER-IDs |
|--------|--------|-----------|---------|---------|
| REQ-0001 | approved [C1] | — | ART-0001..0015 | VER-0001..0004 |
| REQ-0002 | approved [C1] | REQ-0001 | ART-0016..0019 | VER-0005..0006 |
| REQ-0003 | approved [C1] | REQ-0002 | ART-0020..0022 | VER-0007..0008 |
| REQ-0004 | approved [C1] | REQ-0003 | ART-0023..0034 | VER-0009..0012 |
| REQ-0005 | approved [C2] | — | ART-0034..0039 | VER-0013..0014 |
| REQ-0006 | approved [C2] | REQ-0005 | ART-0040..0043 | VER-0015 |
| REQ-0007 | approved [C2] | REQ-0006 | ART-0044..0045 | VER-0016 |
| REQ-0008 | approved [C2] | REQ-0005 | ART-0046..0048 | VER-0017..0018 |
| REQ-0009 | approved [C3] | — | ART-0049..0054 | VER-0019..0020 |
| REQ-0010 | approved [C3] | — | ART-0055..0060 | VER-0021 |
| REQ-0011 | approved [C3] | — | ART-0061..0066, ART-0069 | VER-0022 |
| REQ-0012 | approved [C3] | REQ-0011 | ART-0067..0068, ART-0070 | VER-0023..0024 |

### REQ-0004 — Dashboard/CP SSR prefetch + calendar batch assignee fetch

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |
| Parent | REQ-0003 |

**Statement:** Zero-flash dashboard calendar and control-panel data via SSR prefetch + TanStack cache seed; batch shared-calendar assignee rows; org/users cross-tab invalidation.

**Acceptance criteria:**
1. `/dashboard` SSR prefetches categories, patients, assignees, accepted dashboard-access, merged `FullAppointment[]`; `HomePage` seeds cache before paint.
2. CP org tab SSR prefetches organizations; CP layout seeds doctor + all-user lists for management tabs.
3. Calendar owned cap `CALENDAR_APPOINTMENTS_LIMIT` (100 demo); shared rows via batch `GET /api/appointments?ids=` (not N× detail fetch).
4. `invalidateOrganizations` publishes `CROSS_TAB_SCOPES.ORGANIZATIONS`.
5. `npm test` 472+, tsc, lint, build green.

**Out of scope:** SPA client-nav seed; appointment-types prefetch everywhere; bulk-import snapshot bust.

### REQ-0003 — Invalidation hardening + portal category live panel

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P2 |
| Risk | R1 |
| Owner | Human |
| Parent | REQ-0002 |

**Statement:** Tighten appointment→entity snapshot invalidation (old/new FK, bulk imports), live portal category detail, stats isFetching pulse, cross-tab patients/categories scopes.

**Acceptance criteria:**
1. Category/patient detail snapshots invalidate on old + new FK when appointment category/patient changes.
2. Booking, ICS, Google import bust category caches appropriately.
3. Portal `/categories/:id` uses SSR snapshot seed + live refetch.
4. Stats value slots pulse on background refetch (`isFetching`).

**Out of scope:** Calendar Filters.tsx; patient booking API category_id assignment.

### REQ-0002 — Category gap hardening (snapshot, cache patch, assignees)

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P2 |
| Risk | R1 |
| Owner | Human |
| Parent | REQ-0001 |

**Statement:** Close post-refactor gaps: assignee picker active/inactive, live category detail appointments via snapshot, optimistic category cache patches, metrics isFetching, table header parity.

**Acceptance criteria:**
1. Assignees picker uses active/inactive partition (same as core scheduling selects).
2. CP category detail appointments refetch after appointment CRUD without navigation.
3. Category create/update patches TanStack cache instantly; delete removes detail/snapshot queries.
4. Category list metrics reflect `isFetching`; table headers use clinical column pattern.

**Out of scope:** Calendar Filters.tsx; portal category live panel; UI component tests.

---

## C2 — Doctor CP + Admin Roster (closed 2026-05-31)

### REQ-0005 — Doctor management CP refactor + inactive booking UX

| Field | Value |
|-------|-------|
| Status | approved [C2] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |

**Statement:** CP Doctor Management matches patient/category patterns: `User.is_active`, stats, `ClinicalListFilterToolbar`, emerald table, revenue column, inactive badges on `/services` and booking pickers.

**Acceptance criteria:**
1. `GET /api/users?role=doctor` + `CP_DOCTOR_USERS_FILTERS` (limit 200); SSR seed via CP layout.
2. Doctor table: `DoctorIdentityRow`, sortable revenue (`paid_revenue_cents`), View/Edit/Deactivate only.
3. `doctor-revenue-aggregate.ts` on `GET /api/doctors`; bust via `invalidateUsersAndAuth` / invoice helpers.
4. Inactive doctors: badge on services grid; `DoctorDirectoryPickerList` partition; booking guard `doctor-active-booking.ts`.
5. `npm test` 500+, tsc, lint, build green.

**Constraints:** `queryKeys`; `invalidateUsersAndAuth`; `export const dynamic = "force-dynamic"` on new routes.

**Out of scope:** CP create/delete submit (see REQ-0008); prod pagination UI.

### REQ-0006 — Live assigned-patients + admin user detail parity

| Field | Value |
|-------|-------|
| Status | approved [C2] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0005 |

**Statement:** Doctor detail assigned-patient roster updates on patient CRUD without navigation; `/control-panel/users/[id]` uses `AdminUserDetailScreen` (not legacy `DoctorDetailForm`).

**Acceptance criteria:**
1. `GET /api/doctors/[id]/assigned-patients` + `queryKeys.doctors.assignedPatients`.
2. `invalidateDoctorAssignedPatients` on patient CRUD (`invalidateEntityAffectingAppointments`).
3. SSR prefetch on CP doctor detail page.
4. Admin user detail: slate glass `AdminUserFormDialog`; doctors redirect to `/control-panel/doctors/[id]`.

### REQ-0007 — Admin-only user roster + cross-tab doctors bust

| Field | Value |
|-------|-------|
| Status | approved [C2] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0006 |

**Statement:** User-admin-management lists admins only (`CP_ADMIN_USERS_FILTERS`); cross-tab `ENTITY_PATIENTS` publishes `doctors` scope.

**Acceptance criteria:**
1. `useUsers({ role: "admin" })` on user-admin tab only.
2. `CROSS_TAB_SCOPES.ENTITY_PATIENTS` includes `doctors`.
3. Doctor directory + services refresh after user PATCH without refresh.

### REQ-0008 — CP dev-stub UI (demo create/delete/pagination)

| Field | Value |
|-------|-------|
| Status | approved [C2] |
| Priority | P3 |
| Risk | R0 |
| Parent | REQ-0005 |

**Statement:** Show Add Doctor, Add Admin, Delete confirm, and Load-more UI with disabled submit + API hints; Edit/Deactivate remain live.

**Acceptance criteria:**
1. `cp-dev-stub-copy.ts` + `CpDevStubSubmitNote` + `CpListPaginationDevStub`.
2. Doctor + admin user tables show pagination stub (`GET /api/users?offset=`).
3. `DoctorFormDialog` / `AdminUserFormDialog` `devStub` disables Save; `ConfirmActionDialog.confirmDisabled` on delete.
4. No accidental POST/DELETE in demo; implementer notes reference routes.

---

## Cycle C3 — Calendar scope, filters, billing KPI (2026-06-01)

### REQ-0009 — Staff calendar scope + curated demo seed

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |

**Statement:** Doctor/staff calendar and portal appointment lists include visits where the user is calendar owner **or** treating physician; demo seed provides deterministic 10-row curated matrix aligned with insights/dashboard QA.

**Acceptance criteria:**
1. `staff-appointment-calendar-scope.ts` wired: `GET /api/appointments`, dashboard prefetch, doctor portal, login-today counts.
2. `scripts/seed-demo-appointments-curated.ts` default via `npm run db:seed-demo-appointments`; Demo Doctor sees ~7 scoped visits.
3. Admin dashboard overview appointment KPIs remain org-wide where specified.
4. `npm test` includes `staff-appointment-calendar-scope` coverage.

**Constraints:** `queryKeys` + `invalidateAfterAppointmentMutation`; no hardcoded keys.

**Out of scope:** `calendar/export`, `calendar/sync`, `appointments/search` owner-only paths (follow-up).

### REQ-0010 — Dashboard calendar filters (category, patient, clinical role)

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P2 |
| Risk | R1 |
| Owner | Human |

**Statement:** Staff dashboard toolbar uses rich category/patient dropdowns and clinical-role filter (All My Visits / Created by Me / Referred to Me) with filtered-empty state.

**Acceptance criteria:**
1. `CategoryFilterSelect`, `PatientFilterSelect`, `calendar-clinical-role-filter.ts`, `CalendarFiltersContext.clinicalRole`.
2. `CalendarFiltersEmptyState` when filters hide all rows; reset aligned right.
3. Patient filter shows primary doctor (not treating) per seed contract.
4. Client-only filter; no API shape change.

### REQ-0011 — Invoice billing KPI parity + org billing list UI

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |

**Statement:** CP Invoice Management and Organization billing show four KPI cards (Paid, Outstanding, Refunded, Cancelled) with outstanding matching dashboard (`draft|sent|overdue` only); org panel lists **all** org invoices with visit/doctor context.

**Acceptance criteria:**
1. `invoice-billing-totals.ts` + `InvoiceBillingStatsRow` — Outstanding excludes refunded (€187.50 demo, not €287.50).
2. `GET /api/invoices/billing-totals?organizationId=` + `fetchInvoiceBillingTotalsForOrganization` for org KPI cards.
3. `OrganizationBillingPanel` renders all org invoices (no `slice`); `InvoiceBillingListRow` for rows.
4. `queryKeys.invoices.byOrganization(orgId)` + `byOrganizationTotals(orgId)`; invalidation via `invalidateInvoices*`.
5. Demo curated: Paid €175, Outstanding €187.50, Refunded €100, Cancelled €97.50.

### REQ-0012 — Org billing SSR all orgs + shared outstanding statuses

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0011 |

**Statement:** Organizations tab SSR-prefetches billing for every org (cap 20); server aggregates use `INVOICE_OUTSTANDING_STATUSES`; entity detail empty fields show single em-dash.

**Acceptance criteria:**
1. `prefetchOrgBillingInvoicesByOrgIds` + `prefetchInvoicesForOrganization` on CP organizations section.
2. `invoices-scope.ts` + `invoices-revenue-scope.ts` import shared outstanding statuses.
3. `ClinicalEmptyDash` single glyph; `clinicalEmptyOr` on patient/doctor/category detail rows.
4. `npm test`: `invoice-billing-totals.test.ts`, `org-billing-prefetch.test.ts`, `clinical-empty-dash.test.tsx`.
