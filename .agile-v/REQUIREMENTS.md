# Requirements — HealthCal Pro

<!-- Revision: C1..C10 | C10 active | Last updated: 2026-06-10 -->

## Document Control

| Field | Value |
|-------|-------|
| Cycle | C1–C9 shipped · **C10–C16 shipped** · **C17 active** (REQ-0063) |
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
| REQ-0013 | approved [C3] | REQ-0009 | ART-0071..0074 | VER-0025 |
| REQ-0014 | approved [C3] | — | ART-0075..0077 | VER-0026 |
| REQ-0015 | approved [C3] | REQ-0011 | ART-0078..0088 | VER-0027..0028 |
| REQ-0016 | approved [C4] | — | ART-0086..0100 | VER-0029..0037 |
| REQ-0017 | approved [C4] | REQ-0016 | ART-0094..0095 | VER-0031 |
| REQ-0018 | approved [C4] | — | (main) | verify C4 |
| REQ-0019 | approved [C4] | REQ-0009 | (main) | verify C4 |
| REQ-0020 | approved [C4] | — | (main) | verify C4 |
| REQ-0021 | approved [C5] | — | ART-0101..0108 | VER-0038..0040 |
| REQ-0022 | approved [C5] | REQ-0021 | ART-0109..0114 | VER-0041 |
| REQ-0023 | approved [C5] | REQ-0021 | ART-0115..0118 | VER-0042 |
| REQ-0024 | approved [C5] | REQ-0022 | ART-0119..0122 | VER-0043 |
| REQ-0025 | approved [C5] | REQ-0022 | ART-0123..0124 | VER-0044 |
| REQ-0026 | approved [C5] | — | — | constraint doc |
| REQ-0027 | approved [C6] | — | ART-0126..0130 | VER-0046..0047 |
| REQ-0028 | approved [C6] | REQ-0027 | ART-0131..0138 | VER-0048..0049 |
| REQ-0029 | approved [C6] | REQ-0028 | ART-0139..0142 | VER-0050 |
| REQ-0030 | approved [C6] | — | ART-0143..0150 | VER-0051..0052 |
| REQ-0031 | approved [C6] | REQ-0030 | ART-0151..0155 | VER-0053..0054 |
| REQ-0032 | approved [C6] | REQ-0028 | ART-0156..0162 | VER-0055..0057 |
| REQ-0033 | approved [C6] | REQ-0032 | ART-0163..0168 | VER-0058..0060 |
| REQ-0034 | approved [C7] | — | ART-0169..0174 | VER-0061..0062 |
| REQ-0035 | approved [C7] | — | ART-0175..0182 | VER-0063..0065 |
| REQ-0036 | approved [C7] | REQ-0035 | ART-0183..0187 | VER-0066 |
| REQ-0037 | approved [C7] | — | ART-0188..0192 | VER-0067..0068 |
| REQ-0038 | approved [C8] | — | ART-0202..0208 | pending |
| REQ-0039 | approved [C8] | REQ-0038 | ART-0209..0211 | pending |
| REQ-0040 | approved [C8] | REQ-0038 | ART-0212..0216 | VER-0070 |
| REQ-0041 | approved [C8.1] | REQ-0038 | ART-0217..0219 | VER-0070 |
| REQ-0042 | approved [C9] | REQ-0041 | ART-0220..0222 | VER-0070 |
| REQ-0043 | approved [C9] | REQ-0042 | ART-0223 | VER-0070 |
| REQ-0044 | approved [C9] | REQ-0042 | — | VER-0070 |
| REQ-0045 | approved [C8.1] | REQ-0041 | — | VER-0070 |
| REQ-0046 | approved [C10] | — | ART-0224..0228 | pending |
| REQ-0047 | approved [C10] | REQ-0046 | ART-0229..0232 | pending |
| REQ-0048 | approved [C10] | REQ-0046 | ART-0233..0236 | pending |
| REQ-0049 | approved [C10] | REQ-0046 | ART-0237..0238 | pending |
| REQ-0050 | approved [C10.1] | — | ART-0239..0241 | pending |
| REQ-0051 | approved [C10.1] | REQ-0050 | ART-0242..0245 | pending |
| REQ-0052 | approved [C10.1] | REQ-0050 | ART-0246..0255 | pending |
| REQ-0053 | approved [C10.2] | REQ-0050 | ART-0256..0262 | pending |
| REQ-0054 | approved [C11] | REQ-0050 | ART-0263..0270 | pending |
| REQ-0055 | approved [C12] | REQ-0050 | ART-0271..0278 | pending |
| REQ-0056 | approved [C12.1] | REQ-0055 | ART-0279..0282 | pending |
| REQ-0057 | approved [C12.2] | REQ-0056 | ART-0283..0286 | pending |
| REQ-0059 | approved [C13] | REQ-0057 | ART-0287..0292 | pending |
| REQ-0060 | approved [C14] | REQ-0059 | ART-0293..0300 | pending |
| REQ-0061 | approved [C15] | REQ-0060 | ART-0301..0304 | pending |
| REQ-0062 | approved [C16] | REQ-0059 | ART-0305..0309 | pending |
| REQ-0063 | approved [C17] | REQ-0062 | ART-0310..0313 | pending |

### REQ-0063 — C17 admin table columns + detail footer interactives

| Field | Value |
|-------|-------|
| Status | approved [C17] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0062 |

**Statement:** Fix admin list Joined/Actions column truncation after Phone column; global cursor-pointer on glass footer/back controls; VideoCall h-10 parity on appointment detail.

**Acceptance criteria:**
1. Admin Joined + Actions columns use patient-management width contract (no `w-[1%]` crush).
2. Glass footer/back buttons include `cursor-pointer`; disabled shows `cursor-not-allowed`.
3. VideoCall trigger matches h-10 glass footer row on appointment detail.
4. SSR/invalidation unchanged.
5. Verify PASS.

### REQ-0062 — C16 user-admin violet glass + table/badge parity

| Field | Value |
|-------|-------|
| Status | approved [C16] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0059 |

**Statement:** User-admin-management list, detail, and dialog use full violet glass chrome; admin list table matches patient-management shell contract with Phone column; shared Verified badge with icons and height parity.

**Acceptance criteria:**
1. List, detail card, dialog use violet glass shadows (no slate/zinc frames on admin user surfaces).
2. Admin list uses shared CP clinical list table frame + Phone column; search includes phone.
3. `EntityEmailVerificationBadge` with icons on detail + dialog; height matches Active/Admin badges.
4. SSR/invalidation unchanged; `dynamic = "force-dynamic"` preserved.
5. Verify: `npm test && npx tsc --noEmit && npm run lint && npm run build`.

### REQ-0061 — C15 entity detail spacing + C14 gap closure

| Field | Value |
|-------|-------|
| Status | approved [C15] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0060 |

**Statement:** Remove extra header-to-body gap on entity detail pages; close C14 minor gaps — org members ClinicalDataTable parity, org list SSR seed on detail route, BUILD_MANIFEST ART-0213 update.

**Acceptance criteria:**
1. Entity detail header flush to first body block; body siblings keep `space-y-3` via `EntityDetailPageShell`.
2. Org members table uses `ClinicalDataTable` with indigo snapshot frame parity.
3. Org detail SSR prefetches + seeds `queryKeys.organizations.all` for instant back-to-list.
4. BUILD_MANIFEST ART-0213 references `OrganizationDetailScreen` (not deleted `OrganizationDetailChrome`).
5. Verify: `npm test && npx tsc --noEmit && npm run lint && npm run build`.

### REQ-0060 — C14 entity detail chrome parity

| Field | Value |
|-------|-------|
| Status | approved [C14] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0059 |

**Statement:** All entity detail pages (CP + portal, admin/doctor/patient routes) match PatientDetailScreen chrome — no header border-b, tone glass back links with list invalidation, single footer action row, appointment dedup, invoice layout, organization refactor.

**Acceptance criteria:**
1. `EntityDetailChromeHeader` omits `border-b`; body blocks use `space-y-3` (amended by REQ-0061: header sits flush — no gap to first body block).
2. Shared `EntityDetailBackLink` + `EntityDetailFooterRow`; tone glass back tokens (sky/emerald/slate/violet/indigo/amber).
3. `invalidateQueriesForRoute` covers user-management, organization-management, billing-management list paths.
4. Appointment detail: single footer row (no inline form CRUD strip); Save/Video/Print in footer.
5. Invoice: `resolveEntityDetailRootClass`; header utilities preserved; footer glass parity.
6. Organization detail: client screen + indigo glass card + footer Back To List.
7. All `[id]/page.tsx` retain `dynamic = "force-dynamic"` + SSR seed + CRUD invalidation unchanged.

### REQ-0059 — C13 user-admin UI parity + chrome remount fix

| Field | Value |
|-------|-------|
| Status | approved [C13] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0057 |

**Statement:** User-admin-management list/detail/dialog match patient/category CP parity; fix merged-header action buttons dead after detail/back navigation.

**Acceptance criteria:**
1. `reinitializeControlPanelChromeTab` on section remount; unmount reset clears `activeTab`.
2. Admin list: `PatientStatCard` stats, `ClinicalListFilterToolbar` (status/verification/photo), Status column, slate glass table frame.
3. Admin detail: owned appointments table, status/phone rows, glass back buttons.
4. Add Admin dialog: emerald glass (Doctor parity); expanded form (phone, is_active); create stays `CP_ADMIN_CREATE_STUB`.
5. `email_verified` on user list API select + serializer for filters.

### REQ-0057 — C12.2 CP chrome polish

| Field | Value |
|-------|-------|
| Status | approved [C12.2] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0056 |

**Statement:** Remove dead context registry; align SSR snapshot with same-commit body registration; fix nested description wrapper; AdminUserDetailScreen merged subtitle.

**Acceptance criteria:**
1. No dead `registry`/`setRegistry` in `ControlPanelChromeContext`.
2. Overview/notifications subtitle shows lead + metric on first paint (no static-lead flash).
3. Registered `ControlPanelHeaderSubtitle` not double-wrapped in `pageHeaderDescriptionClass`.
4. Admin user detail shows role lead + SSR appointment count metric.

### REQ-0056 — C12.1 CP chrome tab isolation + hydration fix

| Field | Value |
|-------|-------|
| Status | approved [C12.1] |
| Priority | P0 |
| Risk | R1 |
| Parent | REQ-0055 |

**Statement:** Tab-scoped chrome sync store reset on CP navigation; SSR server snapshot parity; merged subtitles without stale cross-tab bleed; Export CSV shell label parity.

**Acceptance criteria:**
1. Soft nav between CP tabs produces no hydration mismatch on description/actions slots.
2. `setControlPanelChromeActiveTab` clears module singleton before body registers new tab chrome.
3. Overview/notifications show static lead + inline metric skeleton (no fallback swap).
4. Patient management SSR shell label matches live button: `Export CSV`.

### REQ-0055 — C12 CP header subtitle + action parity

| Field | Value |
|-------|-------|
| Status | approved [C12] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0050 |

**Statement:** Inline skeleton subtitles (no fallback swap), overview Refresh SSR shell, unified ControlPanelHeaderGlassButton h-10 parity, notifications toolbar split; fix missing cp-header-subtitle import.

### REQ-0054 — C11 global isMounted parity + invalidation audit

| Field | Value |
|-------|-------|
| Status | approved [C11] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0050 |

**Statement:** Remove remaining `isMounted` hydration gates in doctor-portal, insights, entity detail, and scheduling editors; generalize `useQueryBodyLoading`; route notification CRUD through cross-tab invalidation helper; no Redis (BroadcastChannel + localStorage + SSE already in place).

### REQ-0053 — C10.1 gap closure (hook parity, SSR shells, shell adoption)

| Field | Value |
|-------|-------|
| Status | approved [C10.2] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0050 |

**Statement:** Close C10.1 audit gaps — notifications `initialData`, true SSR header action shells, org actions slot parity, comment cleanup, billing/patient detail `useCpListBodyLoading`, EntityListShell for orgs/appointments; sync org billing seed.

### REQ-0050 — Navbar SSR portrait (no robohash flash)

| Field | Value |
|-------|-------|
| Status | approved [C10.1] |
| Priority | P1 |
| Risk | R1 |

**Statement:** Root layout SSR-seeds `queryKeys.auth.me` before Navbar mounts; avatar skeleton until real user id; no robohash on role-only stub.

### REQ-0051 — CP merged header static action buttons

| Field | Value |
|-------|-------|
| Status | approved [C10.1] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0050 |

**Statement:** Header action buttons (Export CSV, Add Patient, Create Invoice, etc.) visible on first paint via sync registry + static shells; no useLayoutEffect pop-in.

### REQ-0052 — Remaining CP tabs zero-flash

| Field | Value |
|-------|-------|
| Status | approved [C10.1] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0050 |

**Statement:** Extend sync SSR seeds + `useCpListBodyLoading` to overview, telehealth, invitations, visit types, orgs, appointments, notifications, google-calendar; fix visit-types prefetch key; remove full-page spinners.

### REQ-0046 — CP list SSR zero-flash (entity tabs)

| Field | Value |
|-------|-------|
| Status | approved [C10] |
| Priority | P1 |
| Risk | R1 |

**Statement:** Patient, category, doctor, and user-admin CP list pages must match invoice-management refresh behavior: sync SSR cache seed before hooks subscribe; no empty-table flash on hard refresh.

**Acceptance criteria:**
1. Sync `useMemo` seed for patients, categories, doctors directory, admin users (mirror `seedInvoicesListCacheFromSsr`).
2. Hooks read cache as `initialData` + `refetchOnMount: false` when seeded.
3. `listBodyLoading` uses `getQueryState()?.data !== undefined`, not `length > 0`.
4. `users_admin` section prefetch in `control-panel-section-prefetch.ts`.
5. CRUD invalidation unchanged; 863/863 tests pass.

### REQ-0047 — CP entity list server shell (RSC)

| Field | Value |
|-------|-------|
| Status | approved [C10] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0046 |

**Statement:** Extract static list chrome (stats strip frame, toolbar frame, table frame) into `ControlPanelEntityListShell` RSC; client islands hold data + interactions only.

**Acceptance criteria:**
1. `ControlPanelEntityListShell` with tone variants (sky/violet/emerald/slate).
2. Patient, category, doctor, user-admin lists adopt shell without deleting existing components.
3. Sidebar + merged CP header unchanged.

### REQ-0048 — CP entity form UI parity

| Field | Value |
|-------|-------|
| Status | approved [C10] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0046 |

**Statement:** Category, doctor, and admin-user dialogs match patient form patterns: mandatory `*` labels, `ClinicalGlassDatePicker`, primary-doctor-style dropdowns where applicable, icon buttons.

### REQ-0049 — CP detail page anti-flash

| Field | Value |
|-------|-------|
| Status | approved [C10] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0046 |

**Statement:** Category detail removes `isMounted` gate blocking SSR body; doctor detail skeleton only when no `initialUser`; align with patient/invoice patterns.

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

**Statement:** Doctor/staff calendar and portal appointment lists include visits where the user is calendar owner **or** treating physician **or** accepted assignee; demo seed provides deterministic 10-row curated matrix aligned with insights/dashboard QA.

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

### REQ-0013 — Assignee calendar scope (export, sync, search, portal)

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0009 |
| Owner | Human |

**Statement:** Extend staff calendar visibility to accepted assignees (`user_id` / `invited_email`) on all calendar list paths — not only main appointments API.

**Acceptance criteria:**
1. `staff-appointment-calendar-scope.ts` — `staffCalendarVisibilityOrClauses` includes accepted assignee OR clauses.
2. Wired: `GET /api/calendar/export`, `POST /api/calendar/sync`, `GET /api/appointments/search`, doctor-portal API, login-today, non-admin dashboard overview prefetch.
3. SSR: `prefetchDashboardAppointments`, `prefetchDoctorPortal`, `control-panel-section-prefetch`.
4. Tests: `staff-appointment-calendar-scope.test.ts`, `login-today-appointments.test.ts`.

**Out of scope:** Owner-only export/search treating-only follow-up (see CLAUDE.md follow-ups).

### REQ-0014 — Insights telehealth View-as period scope

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P2 |
| Risk | R1 |
| Owner | Human |

**Statement:** Telehealth % KPI follows active View-as period (day/week/month/year/all) — same `start` window as pending chips and avg duration; top-row Today/week/month/YTD remain fixed calendar windows.

**Acceptance criteria:**
1. `fetchTelehealthShareForPeriod` in `insights-aggregate.ts` uses `withAppointmentStartInPeriod`.
2. `getInsightsData` sets `telehealthCount` + `telehealthPct` from period share (not `totals.all`).
3. `AnalyticsOverviewStatsRow` period hint aligns with computed %.
4. Tests: `insights-period-charts.test.ts` (`fetchTelehealthShareForPeriod`).

**Constraints:** Same SSR/API path via `getInsightsData`; `invalidateInsightsAndAnalytics` on appointment CRUD.

### REQ-0015 — Invoice revenue KPI grid + insights billing parity

| Field | Value |
|-------|-------|
| Status | approved [C3] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0011 |
| Owner | Human |

**Statement:** Unified invoice revenue KPI grid (~12 cards) on `/insights`, CP invoice-management, and org billing — exact EUR formatting, status breakdown buckets, paid-in-period with `paid_at` + `created_at` fallback, vs-prior month comparison.

**Acceptance criteria:**
1. `InvoiceRevenueKpiGrid` + `invoice-revenue-kpi-presets.ts`; `formatBillingKpiMoney` exact decimals.
2. `fetchRevenueAggregates` + `billing-totals` API return `statusTotals` + `paidInPeriodCount`.
3. `insights-paid-collected.ts` — paid_in_period uses `paid_at`, fallback `created_at`.
4. `AnalyticsRevenueStatsRow` + `InvoiceManagement` + `OrganizationBillingPanel` wired; chart labels use `formatBillingKpiMoney`.
5. Invalidation: `invalidateInvoices*` busts `invoices.all` incl. `byOrganizationTotals`.
6. Tests: `invoice-billing-totals.test.ts`, `invoice-paid-period.test.ts`, `org-billing-prefetch.test.ts`.

---

## C4 — Invoice dialog + detail + RBAC + badges (draft)

### REQ-0016 — Amber glass invoice form dialog + staff shell

| Field | Value |
|-------|-------|
| Status | approved [C4] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |

**Statement:** Staff can create and edit invoices via amber glass `InvoiceFormDialog` with rich visit picker; dialog available on CP, dashboard, doctor, appointments, and invoices layouts via `StaffInvoiceDialogShell` and `InvoiceFormDialogProvider`.

**Acceptance criteria:**
1. Create + edit modes share one dialog; preset create from appointment ⋮ and detail **New Invoice**.
2. `useInvoiceFormDialogController` + `invoice-form-guards.ts` enforce RBAC and form guards.
3. Visit picker uses `useBillingAppointmentOptionById` + billing invalidation on write.
4. `npm test` regression green for invoice-dialog paths.

### REQ-0017 — Invoice detail live + visit summary on payments

| Field | Value |
|-------|-------|
| Status | approved [C4] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0016 |

**Statement:** Invoice detail page uses `InvoiceDetailLiveBody` + `useInvoice`; header **Edit details**; `GET /api/invoices/[id]` with prefetch; `/api/payments` attaches `visit_summary`.

### REQ-0018 — Doctor invoice edit RBAC

| Field | Value |
|-------|-------|
| Status | approved [C4] |
| Priority | P1 |
| Risk | R2 |

**Statement:** Doctors may PATCH own invoices in `draft`, `sent`, or `overdue` only — fields `description`, `due_date` via `mutate`; other statuses blocked.

### REQ-0019 — Calendar hover invoice badge map

| Field | Value |
|-------|-------|
| Status | approved [C4] |
| Priority | P2 |
| Risk | R1 |
| Parent | REQ-0009 |

**Statement:** Day/Week/Month/List hover cards show invoice badge via `useAppointmentInvoiceDisplayMap` without N+1 fetches.

### REQ-0020 — SSE notification stream hardening

| Field | Value |
|-------|-------|
| Status | approved [C4] |
| Priority | P2 |
| Risk | R1 |

**Statement:** `notification-stream-sse.ts` safe enqueue; stream route abort + error stop; no heartbeat spam on disconnect.

---

## C5 — Entity detail Record Audit (active)

### REQ-0021 — Shared Record Audit UI + entity mappers

| Field | Value |
|-------|-------|
| Status | approved [C5] |
| Priority | P1 |
| Risk | R1 |

**Statement:** Entity detail pages show Record Audit block: Created / Last updated with timestamp · avatar · email · role badge via shared components and mappers.

**Acceptance criteria:**
1. `EntityDetailRecordAuditCard`, `EntityDetailAuditActorInline`, `entity-detail-audit-actor.ts` mappers for patient/category/user/appointment.
2. Wired on appointment, patient, category, doctor detail screens.
3. Sentence case **Last updated:** label.
4. Unit tests in `entity-detail-audit-actor.test.ts`.

### REQ-0022 — DB audit FKs + Prisma includes + serializers

| Field | Value |
|-------|-------|
| Status | approved [C5] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0021 |

**Statement:** Appointments, users, categories, patients expose `created_by`/`updated_by` with denormalized serializer fields for client cache.

**Acceptance criteria:**
1. Migrations `013`–`015` + `schema.prisma` audit relations.
2. `*AuditUserPick` includes; `serializePatient/Category/User`; appointment view-model actors.
3. API writes set `updated_by_id` on PATCH/POST where applicable.
4. List endpoints omit audit joins (see REQ-0026).

### REQ-0023 — Appointment detail polish + invoice issued audit rows

| Field | Value |
|-------|-------|
| Status | approved [C5] |
| Priority | P1 |
| Parent | REQ-0021 |

**Statement:** Appointment detail header live subtitle; Visit Overview; invoice issued/due/paid rows; `issuer_email`/`issuer_role` on visit summary.

### REQ-0024 — CP admin user Record Audit parity

| Field | Value |
|-------|-------|
| Status | approved [C5] |
| Priority | P1 |
| Parent | REQ-0022 |

**Statement:** `/control-panel/users/[id]` admin roster detail shows Record Audit like doctor detail; SSR `userDetailInclude`; `useUser` SSR seed.

### REQ-0025 — User audit backfill + seed stamp

| Field | Value |
|-------|-------|
| Status | approved [C5] |
| Priority | P2 |
| Parent | REQ-0022 |

**Statement:** Idempotent `npm run db:backfill-user-audit`; `seed-test-user` stamps `created_by_id`/`updated_by_id`/`updated_at` for demo users.

### REQ-0026 — List API performance constraint (document)

| Field | Value |
|-------|-------|
| Status | approved [C5] |
| Priority | P3 |
| Risk | R0 |

**Statement:** List endpoints use `USER_API_SELECT` / light selects without audit joins; detail GET + SSR use full includes. Not a defect.

---

## C6 — Invoice violet + visit location parity (active)

### REQ-0027 — Visit fee badge surface parity

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P2 |
| Risk | R1 |

**Statement:** `VisitFeeBadge` + per-surface size tokens (`cardMeta`, `wizard`, `picker`, `table`, `services`) on booking, cards, portal, services.

### REQ-0028 — Invoice detail violet + header actions + PDF

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0017 |

**Statement:** Invoice detail violet glass; header Generate (draft→sent) + Download; `GET /api/invoices/[id]/pdf?download=1`; linked visit badge alignment.

**Acceptance criteria:**
1. `invoice-detail-ui-classes.ts` violet tokens; card shadows restored.
2. `InvoiceDetailHeaderActions` — Generate via `updateInvoice`; Download attachment.
3. `invoice-detail-action-capabilities.ts` dedupes footer Send when header Generate shows.
4. `invalidateAfterInvoiceWrite` on status change.

### REQ-0029 — Invoice dialog violet + entity chrome

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P1 |
| Parent | REQ-0028 |

**Statement:** Amber→violet invoice dialog/list; `PatientDetailScreen` → `EntityDetailChromeHeader`; identity row alignment.

### REQ-0030 — Visit location shared resolver (portal/booking/cards)

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P1 |
| Risk | R1 |

**Statement:** `appointment-visit-location.ts` + `AppointmentVisitScheduleMeta`; patient book POST persists doctor `office_location`; portal includes `office_location`; cards/detail/timeline/compact.

**Acceptance criteria:**
1. `portal-appointment-prisma-include.ts` clinician embed synced (API + prefetch).
2. `AppointmentCard`, `PortalAppointmentTimelineCard`, `AppointmentDetailScreenShared`, booking steps 2/3.
3. `invalidateAfterAppointmentMutation` on patient booking.

### REQ-0031 — Location fallback (doctor portal, dashboard, snapshot)

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P1 |
| Parent | REQ-0030 |

**Statement:** `resolveAppointmentDisplayLocation` / `resolveSnapshotAppointmentDisplayLocation` on doctor portal list, CP dashboard queue, patient snapshot Location column.

**Out of scope:** Native binary PDF (HTML print attachment accepted).

### REQ-0032 — Invoice detail patient UX (title + payment history)

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P1 |
| Parent | REQ-0028 |

**Statement:** Detail header plain visit title (no self-link); `{visit} · Invoice` section heading; payment history glass badges + tinted amounts + human payment reference labels.

**Acceptance criteria:**
1. `resolveInvoiceDetailHeaderTitle` skips demo seed slugs.
2. `PaymentStatusBadge` + `payment-status-display.ts`.
3. `InvoiceStatusBadge` icons; payment table column Payment reference.

### REQ-0033 — Badge font-normal + entity ID clipboard copy

| Field | Value |
|-------|-------|
| Status | approved [C6] |
| Priority | P2 |
| Parent | REQ-0032 |

**Statement:** All badge label text renders `font-normal`; entity IDs on detail surfaces show inline Copy → Check clipboard (full UUID copied; short `#xxxxxxxx` display where applicable).

**Acceptance criteria:**
1. `Badge` + `.calendar-glass-badge` tokens set `font-normal`.
2. `EntityIdCopyInline` on invoice header, detail ID rows, payment history Payment ID.
3. `entity-id-display` + `copy-to-clipboard` unit tests; full regression pass.

### REQ-0034 — Services catalog brand mark + type filter

| Field | Value |
|-------|-------|
| Status | approved [C7] |
| Priority | P2 |
| Risk | R1 |

**Statement:** Appointment service catalog shows per-type icon/color tiles; doctor grid and services row filter by selected catalog type.

**Acceptance criteria:**
1. DB `icon`/`color` on appointment types → API + SSR prefetch.
2. `AppointmentTypeBrandMark` + `ServicesCatalogTypeSelect` filter doctor grid.
3. `invalidateAppointmentTypeDerived` on type CRUD.

### REQ-0035 — Appointment cancelled status + RBAC + notify + UI

| Field | Value |
|-------|-------|
| Status | approved [C7] |
| Priority | P1 |
| Risk | R1 |

**Statement:** Staff can cancel visits via PATCH `status: "cancelled"` with RBAC; cancelled excluded from scheduling; status badge on all surfaces.

**Acceptance criteria:**
1. Prisma `cancelled_at`/`cancelled_by_id`; `appointment-cancel-access.ts`.
2. `appointment-id-write.ts` shared PUT/PATCH; `appointment-notify.ts` fan-out.
3. `AppointmentStatusGlassBadge` + `AppointmentActionsMenu` cancel; `useAppointments.cancelAppointment`.
4. `invalidateAfterAppointmentMutation` on cancel.

### REQ-0036 — Reminder cron + optional Brevo SMS

| Field | Value |
|-------|-------|
| Status | approved [C7] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0035 |

**Statement:** `/api/cron/reminders` dedupes via `reminder_sent_at`; sends patient email + in-app notify; optional SMS when `BREVO_SMS_API_KEY` set.

**Acceptance criteria:**
1. Skip done/cancelled; `cron-reminder-candidates.ts`.
2. `reminder-recipient-phone.ts` — user.phone → patient.phone.
3. `brevo-sms.ts` no-op without API key.

### REQ-0037 — Patient contact phone end-to-end

| Field | Value |
|-------|-------|
| Status | approved [C7] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0036 |

**Statement:** `patients.phone` on create/edit/detail/list with validation; supports SMS fallback when no linked user phone.

**Acceptance criteria:**
1. Migration + `serializePatient` + POST/PUT API + `phone-validation.ts`.
2. `PatientFormDialog` + CP/portal detail + list Phone column + search.
3. `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` on write.
4. `npm run db:seed-phones` after `prisma:push`.

### REQ-0038 — Unified AppPageChrome + CP section headers (14 routes)

| Field | Value |
|-------|-------|
| Status | approved [C8] |
| Priority | P1 |
| Risk | R1 |

**Statement:** Single `AppPageChrome` primitive + `control-panel-page-chrome-config` drives icon tile, tone, title/subtitle, border-b on all 14 CP list routes; portal parity via thin wrappers.

**Acceptance criteria:**
1. `AppPageChrome`, `ControlPanelPageChrome`, tone tokens in `page-chrome-classes.ts`.
2. All CP list sections use `ControlPanelPageChrome` (no inline `h2` / text-only `PageHeader`).
3. Invitation tabs get page-level chrome in `ControlPanelSectionContent`.
4. `PageHeader` / `PortalChromeHeader` delegate to `AppPageChrome` (no deletion).

### REQ-0039 — CP SSR chrome shell + skeleton flash reduction

| Field | Value |
|-------|-------|
| Status | approved [C8] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0038 |

**Statement:** Server-render static CP section chrome; tighten `listBodyLoading` when SSR cache warm; invitation tab prefetch.

**Acceptance criteria:**
1. `ControlPanelSectionChromeServer` in `ControlPanelSectionServerPage`.
2. `listBodyLoading = isLoading && !hasCache` on list sections.
3. Invitation tabs prefetch in `control-panel-section-prefetch.ts`.
4. `force-dynamic` on `organizations/[id]/page.tsx` if missing.

### REQ-0040 — Admin portal redesign (shared components)

| Field | Value |
|-------|-------|
| Status | approved [C8] |
| Priority | P1 |
| Risk | R1 |
| Parent | REQ-0038 |

**Statement:** Admin portal uses `AppPageChrome`, `PatientStatCard` KPIs, shared appointment/doctor list patterns; `invalidateAdminPortal` unchanged.

**Acceptance criteria:**
1. Replace glass card `h1` with `AppPageChrome` portal variant.
2. KPI grid uses `PatientStatCard`; pulse only when `!hasCache && isLoading`.
3. Recent appointments + doctor directory reuse shared clinical list components.
4. CRUD elsewhere updates admin portal in-place without refresh.
