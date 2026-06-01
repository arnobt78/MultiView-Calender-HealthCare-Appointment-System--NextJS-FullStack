# Test Specification — HealthCal Pro

<!-- Cycle: C1+C2 | Last updated: 2026-05-31 | C2 Gate 2 closed -->

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

## Regression Baseline

| Suite | Command | Scope |
|-------|---------|-------|
| Unit / lib | `npm test` | 79 files, 520 tests (C2) |
| Typecheck | `npx tsc --noEmit` | strict TS |
| Lint | `npm run lint` | ESLint |
| Release | `npm run build` | Next.js production |
