# Test Specification — HealthCal Pro

<!-- Cycle: C1+C2+C3 | Last updated: 2026-06-02 | C3 verify (REQ-0013..0015 extension) -->

## Test Cases

| TC-ID | Cycle | REQ-ID | Type | Description | Command / Path | Status |
|-------|-------|--------|------|-------------|----------------|--------|
| TC-0001 | C1 | REQ-0001 | unit | Active/inactive entity partition | `entity-active-status.test.ts` | PASS |
| TC-0002 | C1 | REQ-0002 | unit | Category cache + query client | `category-query-client.test.ts` | PASS |
| TC-0003 | C1 | REQ-0003 | unit | Appointment mutation invalidation | `appointment-mutation-invalidation.test.ts` | PASS |
| TC-0004 | C1 | REQ-0004 | unit | Extra assigned appointment ID resolver | `appointments-calendar-assignees.test.ts` | PASS |
| TC-0005 | C1 | REQ-0004 | unit | Org cross-tab scope contract | `query-cache-cross-tab.test.ts` | PASS |
| TC-0006 | C1 | REQ-0001..0004 | regression | Full Vitest suite | `npm test` | PASS |
| TC-0007 | C1 | REQ-0001..0004 | regression | TypeScript strict | `npx tsc --noEmit` | PASS |
| TC-0008 | C1 | REQ-0001..0004 | regression | ESLint | `npm run lint` | PASS |
| TC-0009 | C1 | REQ-0001..0004 | regression | Production build | `npm run build` | PASS |
| TC-0010 | C2 | REQ-0005 | regression | Doctor revenue / access tests | `npm test` | PASS |
| TC-0011 | C2 | REQ-0006 | unit | Patient access matrix | `patient-access.test.ts` | PASS |
| TC-0012 | C2 | REQ-0007 | unit | Cross-tab doctors scope | `query-cache-cross-tab.test.ts` | PASS |
| TC-0013 | C2 | REQ-0005..0008 | regression | Full Vitest suite | `npm test` | PASS |
| TC-0014 | C2 | REQ-0005..0008 | regression | TypeScript strict | `npx tsc --noEmit` | PASS |
| TC-0015 | C2 | REQ-0005..0008 | regression | ESLint + build | `npm run lint`, `npm run build` | PASS |
| TC-0016 | C3 | REQ-0009 | unit | Staff calendar scope | `staff-appointment-calendar-scope.test.ts` | PASS |
| TC-0017 | C3 | REQ-0010 | unit | Clinical role + filter empty state | `calendar-clinical-role-filter.test.ts`, `calendar-filters-empty-state.test.tsx` | PASS |
| TC-0018 | C3 | REQ-0011 | unit | Invoice billing totals buckets | `invoice-billing-totals.test.ts` | PASS |
| TC-0019 | C3 | REQ-0012 | unit | Org billing prefetch + empty dash | `org-billing-prefetch.test.ts`, `clinical-empty-dash.test.tsx` | PASS |
| TC-0020 | C3 | REQ-0009..0012 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0021 | C3 | REQ-0013 | unit | Assignee scope + login-today | `staff-appointment-calendar-scope.test.ts`, `login-today-appointments.test.ts` | PASS |
| TC-0022 | C3 | REQ-0014 | unit | Telehealth View-as period | `insights-period-charts.test.ts` | PASS |
| TC-0023 | C3 | REQ-0015 | unit | Invoice revenue KPI + paid period | `invoice-billing-totals.test.ts`, `invoice-paid-period.test.ts`, `org-billing-prefetch.test.ts` | PASS |
| TC-0024 | C3 | REQ-0009..0015 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0025 | C4 | REQ-0016 | unit | Invoice list + visit fee | `billing-visit-fee`, `invoice-management-columns` | PASS |
| TC-0026 | C4 | REQ-0017 | unit | Invoice detail UI classes | `invoice-detail-ui-classes` | PASS |
| TC-0027 | C5 | REQ-0021 | unit | Entity audit mappers | `entity-detail-audit-actor.test.ts` | PASS |
| TC-0028 | C5 | REQ-0022 | regression | Serializers + includes | full regression | PASS |
| TC-0029 | C5 | REQ-0023 | unit | Appointment view-model audit | `appointment-detail-view-model.test.ts` | PASS |
| TC-0030 | C5 | REQ-0024 | regression | Admin user detail path | full regression | PASS |
| TC-0031 | C5 | REQ-0025 | manual | Backfill idempotent | `db:backfill-user-audit` | PASS |
| TC-0032 | C6 | REQ-0027 | unit | Visit fee + booking display | `appointment-visit-fee-display`, visit fee tests | PASS |
| TC-0033 | C6 | REQ-0028..0029 | unit | Invoice detail/dialog capabilities | `invoice-detail-action-capabilities` | PASS |
| TC-0034 | C6 | REQ-0030 | unit | Visit location resolver | `appointment-visit-location.test.ts` | PASS |
| TC-0035 | C6 | REQ-0031 | regression | Doctor portal + dashboard embed | full regression | PASS |
| TC-0036 | C6 | REQ-0031 | unit | Snapshot location fallback | `appointment-visit-location.test.ts` snapshot case | PASS |
| TC-0037 | C6 | REQ-0027..0031 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0038 | C7 | REQ-0034 | regression | Services catalog + filter | full regression | PASS |
| TC-0039 | C7 | REQ-0035 | unit | Cancel RBAC + id-write + notify | `appointment-cancel-access`, `appointment-id-write`, `appointment-notify` | PASS |
| TC-0040 | C7 | REQ-0035 | unit | Status display + card cancelled | `appointment-status-display`, `AppointmentCard.ui` | PASS |
| TC-0041 | C7 | REQ-0036 | unit | Cron candidates + SMS phone resolver | `cron-reminder-candidates`, `reminder-recipient-phone` | PASS |
| TC-0042 | C7 | REQ-0037 | unit | Phone validation + form clinical | `phone-validation`, `patient-form-clinical` | PASS |
| TC-0043 | C7 | REQ-0034..0037 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0044 | C23 | REQ-0066 | unit | Org members display + role count row | `organization-members-display.test.ts`, `OrganizationMembersRoleCountInlineRow.test.tsx` | PASS |
| TC-0045 | C23 | REQ-0066 | unit | Doctor detail display subtitle | `doctor-detail-display.test.ts` | PASS |
| TC-0046 | C23 | REQ-0066 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0047 | C23.1 | REQ-0067 | unit | Org members filter lib | `organization-detail-members-filter.test.ts` | PASS |
| TC-0048 | C23.1 | REQ-0067 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0049 | C24 | REQ-0068 | unit | Filter select presets | `filter-select-option-presets.test.ts` | PASS |
| TC-0050 | C24 | REQ-0068 | regression | Full suite + tsc + lint + build | project default | PASS |
| TC-0051 | C25 | REQ-0069 | unit | Calendar empty copy + doctor identity + weekday presets | `calendar-filters-empty-copy.test.ts`, `doctor-identity-map.test.ts`, `filter-select-option-presets.test.ts` | PASS |
| TC-0052 | C25 | REQ-0069 | regression | Full suite + tsc + lint + build | project default | PASS |

## Regression Baseline

| Suite | Command | Scope |
|-------|---------|-------|
| Unit / lib | `npm test` | **158** files, **829** tests (C7) |
| Typecheck | `npx tsc --noEmit` | strict TS |
| Lint | `npm run lint` | ESLint |
| Release | `npm run build` | Next.js production |
