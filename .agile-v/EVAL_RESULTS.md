---
eval_run_id: ER-C1-REQ0001
eval_timestamp: "2026-05-30T11:34:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "npm test 450/450, tsc --noEmit, eslint clean for REQ-0001"
thresholds:
  first_pass_percent: 80
  requirement_coverage_percent: 100
  regression_pass_percent: 100
---

# Eval Results — HealthCal Pro

## Suite Runs

| Suite | Command | Result | FT-CODE | Notes |
|-------|---------|--------|---------|-------|
| entity-active-status | npm test entity-active-status | PASS | — | 5 cases |
| full regression | npm test | PASS | — | 450/450 |
| typecheck | npx tsc --noEmit | PASS | — | |
| lint | npm run lint | PASS | — | |

## Eval Gate Status

**PASS** — Ready for Human Gate 2 merge/release approval when desired.
