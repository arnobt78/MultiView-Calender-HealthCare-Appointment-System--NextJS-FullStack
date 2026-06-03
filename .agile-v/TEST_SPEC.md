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

## Regression Baseline

| Suite | Command | Scope |
|-------|---------|-------|
| Unit / lib | `npm test` | 114 files, 638 tests (C3) |
| Typecheck | `npx tsc --noEmit` | strict TS |
| Lint | `npm run lint` | ESLint |
| Release | `npm run build` | Next.js production |
