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

---

## C2 Close — ER-C2-CLOSE

```yaml
eval_run_id: ER-C2-CLOSE
eval_timestamp: "2026-05-31T16:10:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C2 closure — npm test 520/520, tsc, eslint, build PASS for REQ-0005..0008"
cycle: C2
release_commit: "2d9a932"
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 520/520 | REQ-0005..0008 |
| typecheck | npx tsc --noEmit | PASS | REQ-0005..0008 |
| lint | npm run lint | PASS | REQ-0005..0008 |
| release build | npm run build | PASS | REQ-0005..0008 |

**EvalGate (active):** PASS — C2 archived to `.agile-v/cycles/C2/`.

---

## C3 Verify — ER-C3-VERIFY (refresh 2026-06-04)

```yaml
eval_run_id: ER-C3-VERIFY
eval_timestamp: "2026-06-04T12:24:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C3 extended — npm test 666/666 (120 files), tsc, eslint, build PASS for REQ-0009..0015"
cycle: C3
release_commit: "6f13cc2"
human_gate_2: GATE-0006
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| staff-appointment-calendar-scope | npm test staff-appointment-calendar-scope | PASS | REQ-0009, REQ-0013 |
| login-today-appointments | npm test login-today-appointments | PASS | REQ-0013 |
| calendar-clinical-role-filter | npm test calendar-clinical-role-filter | PASS | REQ-0010 |
| invoice-billing-totals | npm test invoice-billing-totals | PASS | REQ-0011, REQ-0015 |
| invoice-paid-period | npm test invoice-paid-period | PASS | REQ-0015 |
| org-billing-prefetch | npm test org-billing-prefetch | PASS | REQ-0012, REQ-0015 |
| insights-period-charts | npm test insights-period-charts | PASS | REQ-0014 |
| clinical-empty-dash | npm test clinical-empty-dash | PASS | REQ-0012 |
| full regression | npm test | PASS 666/666 | REQ-0009..0015 |
| typecheck | npx tsc --noEmit | PASS | REQ-0009..0015 |
| lint | npm run lint | PASS | REQ-0009..0015 |
| release build | npm run build | PASS | REQ-0009..0015 |

**EvalGate (active):** PASS (automated) — Human Gate 2 pending before `cycles/C3/` freeze.

---

## C5 Verify — ER-C5-VERIFY

```yaml
eval_run_id: ER-C5-VERIFY
eval_timestamp: "2026-06-04T18:30:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C5 Record Audit — npm test 742/742 (138 files), tsc, eslint, build PASS for REQ-0021..0025"
cycle: C5
release_commit: "d826ca7"
human_gate_1: GATE-0009
human_gate_2: GATE-0010
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| entity-detail-audit-actor | npm test entity-detail-audit-actor | PASS | REQ-0021 |
| appointment-detail-view-model | npm test appointment-detail-view-model | PASS | REQ-0021, REQ-0023 |
| full regression | npm test | PASS 742/742 | REQ-0021..0025 |
| typecheck | npx tsc --noEmit | PASS | REQ-0021..0025 |
| lint | npm run lint | PASS | REQ-0021..0025 |
| release build | npm run build | PASS | REQ-0021..0025 |

**EvalGate (C5 active):** PASS (automated) — Human Gates 9–10 pending before `cycles/C5/` freeze.

---

## C6 Verify — ER-C6-VERIFY

```yaml
eval_run_id: ER-C6-VERIFY
eval_timestamp: "2026-06-05T17:40:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C6 invoice violet + visit location — npm test 772/772 (145 files), tsc, eslint, build PASS for REQ-0027..0031"
cycle: C6
release_commit: "629c3ed"
human_gate_1: GATE-0011
human_gate_2: GATE-0012
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| appointment-visit-location | npm test appointment-visit-location | PASS | REQ-0030, REQ-0031 |
| full regression | npm test | PASS 772/772 | REQ-0027..0031 |
| typecheck | npx tsc --noEmit | PASS | REQ-0027..0031 |
| lint | npm run lint | PASS | REQ-0027..0031 |
| release build | npm run build | PASS | REQ-0027..0031 |

**EvalGate (C6 active):** PASS (automated) — Human Gates 11–12 pending before `cycles/C6/` freeze.
