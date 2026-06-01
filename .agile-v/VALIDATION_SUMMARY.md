# Validation Summary — HealthCal Pro

<!-- Cycle: C1 | REQ-0001..0004 | Last updated: 2026-05-30 | Gate 2: CLOSED -->

## Scope

| Item | Value |
|------|-------|
| Cycle | C1 |
| ART-IDs | ART-0001..ART-0033 |
| REQ-IDs | REQ-0001, REQ-0002, REQ-0003, REQ-0004 |
| TC count | TC-0001..0009 |
| Regression | 472/472 Vitest |

## Results

| Result | Count |
|--------|-------|
| PASS | 472 |
| FAIL | 0 |
| FLAG | 0 |

## Verification Records

| VER-ID | TC-ID | REQ-ID | Result | FT-CODE | Description |
|--------|-------|--------|--------|---------|-------------|
| VER-0001 | TC-0001 | REQ-0001 | PASS | — | entity-active-status Vitest suite |
| VER-0002 | TC-0006 | REQ-0001 | PASS | — | npm test regression (C1 tranche 1) |
| VER-0003 | TC-0007 | REQ-0001 | PASS | — | npx tsc --noEmit |
| VER-0004 | TC-0008 | REQ-0001 | PASS | — | npm run lint |
| VER-0005 | TC-0002 | REQ-0002 | PASS | — | category-query-client + assignee partition |
| VER-0006 | TC-0006 | REQ-0002 | PASS | — | npm test 455+, tsc, lint, build |
| VER-0007 | TC-0003 | REQ-0003 | PASS | — | appointment-mutation-invalidation tests |
| VER-0008 | TC-0006 | REQ-0003 | PASS | — | npm test 459+, tsc, lint, build |
| VER-0009 | TC-0004 | REQ-0004 | PASS | — | appointments-calendar-assignees tests |
| VER-0010 | TC-0005 | REQ-0004 | PASS | — | ORGANIZATIONS cross-tab scope test |
| VER-0011 | TC-0006 | REQ-0004 | PASS | — | npm test 472/472 |
| VER-0012 | TC-0009 | REQ-0004 | PASS | — | npm run build |

## Coverage

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0001 | TC-0001 + regression | PASS |
| REQ-0002 | TC-0002 + regression | PASS |
| REQ-0003 | TC-0003 + regression | PASS |
| REQ-0004 | TC-0004, TC-0005 + regression + build | PASS |

## Red Team Sign-Off

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-05-30T13:10:00Z |
| Evidence | commit `3a563d7`, 472 tests, build PASS |
| LINKED_REQ | REQ-0001..0004 |

## Audit Trail

| Timestamp | Agent | Entry | LINKED_REQ |
|-----------|-------|-------|------------|
| 2026-05-30 | build | Category management refactor complete | REQ-0001 |
| 2026-05-30 | build | Invalidation + portal category live | REQ-0002, REQ-0003 |
| 2026-05-30 | build | SSR prefetch + batch assignee fetch | REQ-0004 |
| 2026-05-30 | red-team | C1 Gate 2 automated verification PASS | REQ-0001..0004 |

---

EvalGate: status=PASS | eval_run_id=ER-C1-CLOSE | policy_version_ref=1.0.0 | eval_results_path=.agile-v/EVAL_RESULTS.md

---

## C2 — Doctor CP Tranche (closed 2026-05-31)

| Item | Value |
|------|-------|
| Cycle | C2 |
| ART-IDs | ART-0034..ART-0048 |
| REQ-IDs | REQ-0005..REQ-0008 |
| Regression | 520/520 Vitest |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0013 | TC-0010 | REQ-0005 | PASS | Doctor tranche regression |
| VER-0014 | TC-0013 | REQ-0005 | PASS | Full suite at C2 synthesis |
| VER-0015 | TC-0011 | REQ-0006 | PASS | Patient access tests |
| VER-0016 | TC-0012 | REQ-0007 | PASS | Cross-tab doctors scope |
| VER-0017 | TC-0014 | REQ-0008 | PASS | tsc strict |
| VER-0018 | TC-0015 | REQ-0008 | PASS | lint + build |

EvalGate (C2): status=PASS | eval_run_id=ER-C2-CLOSE | release_commit=2d9a932
