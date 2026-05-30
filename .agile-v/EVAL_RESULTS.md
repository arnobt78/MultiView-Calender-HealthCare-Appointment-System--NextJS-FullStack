---
eval_run_id: ER-INIT
eval_timestamp: "2026-05-30T00:00:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PENDING
eval_gate_rationale: "No verification run yet — bootstrap only"
thresholds:
  first_pass_percent: 80
  requirement_coverage_percent: 100
  regression_pass_percent: 100
---

# Eval Results — HealthCal Pro

## Suite Runs

| Suite | Command | Result | FT-CODE | Notes |
|-------|---------|--------|---------|-------|
| — | — | — | — | — |

## Eval Gate Status

**PENDING** — Run Red Team verification before Gate 2. Update `eval_gate_status` to `PASS`, `FAIL`, or `WAIVED` (WAIVED requires `APPROVALS.md` reference in rationale).

## Failure Taxonomy (FT codes)

| Code | Meaning |
|------|---------|
| FT-PLAN | Plan/skip step deviation |
| FT-TOOL | Bad tool args / disallowed tool |
| FT-MISP | Misread of output |
| FT-UNSUPPORT | Impossible request |
| FT-POLICY | Policy block |
| FT-SYS | Infra/provider failure |
