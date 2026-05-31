---
eval_run_id: ER-C1-CLOSE
eval_timestamp: "2026-05-30T13:10:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C1 closure — npm test 472/472, tsc, eslint, build PASS for REQ-0001..0004"
thresholds:
  first_pass_percent: 80
  requirement_coverage_percent: 100
  regression_pass_percent: 100
cycle: C1
release_commit: "3a563d7"
---

# Eval Results — HealthCal Pro

## Suite Runs (C1 Close)

| Suite | Command | Result | FT-CODE | Notes |
|-------|---------|--------|---------|-------|
| entity-active-status | npm test entity-active-status | PASS | — | REQ-0001 |
| category-query-client | npm test category-query-client | PASS | — | REQ-0002 |
| appointment-mutation-invalidation | npm test appointment-mutation-invalidation | PASS | — | REQ-0003 |
| appointments-calendar-assignees | npm test appointments-calendar-assignees | PASS | — | REQ-0004 |
| query-cache-cross-tab | npm test query-cache-cross-tab | PASS | — | REQ-0004 |
| full regression | npm test | PASS | — | 472/472 |
| typecheck | npx tsc --noEmit | PASS | — | |
| lint | npm run lint | PASS | — | |
| release build | npm run build | PASS | — | Gate 2 RC |

## Prior Runs

| eval_run_id | Scope | Status |
|-------------|-------|--------|
| ER-C1-REQ0001 | REQ-0001 tranche | PASS |

## Eval Gate Status

**PASS** — C1 Human Gate 2 closed with automated Red Team verification. Archived to `.agile-v/cycles/C1/`.
