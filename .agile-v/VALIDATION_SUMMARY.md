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

---

## C3 — Calendar scope + filters + billing (bootstrap 2026-06-01)

| Item | Value |
|------|-------|
| Cycle | C3 |
| ART-IDs | ART-0049..ART-0068 |
| REQ-IDs | REQ-0009..REQ-0012 |
| Mode | Retroactive (code on `main` before Gate 1) |
| Regression | 666/666 Vitest (120 files) — refresh 2026-06-04 |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0019 | TC-0016 | REQ-0009 | PASS | Staff appointment calendar scope |
| VER-0020 | TC-0016 | REQ-0009 | PASS | Full regression at C3 verify |
| VER-0021 | TC-0017 | REQ-0010 | PASS | Clinical role + filter empty state |
| VER-0022 | TC-0018 | REQ-0011 | PASS | Invoice billing totals (outstanding excludes refunded) |
| VER-0023 | TC-0019 | REQ-0012 | PASS | Org billing prefetch + clinical empty dash |
| VER-0024 | TC-0020 | REQ-0009..0012 | PASS | tsc + lint + build |
| VER-0025 | TC-0021 | REQ-0013 | PASS | Assignee scope export/sync/search/portal |
| VER-0026 | TC-0022 | REQ-0014 | PASS | Telehealth View-as period share |
| VER-0027 | TC-0023 | REQ-0015 | PASS | Invoice revenue KPI + paid period |
| VER-0028 | TC-0024 | REQ-0009..0015 | PASS | Full regression 666 + tsc + lint + build |

## Coverage (C3)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0009 | TC-0016 + regression | PASS |
| REQ-0010 | TC-0017 + regression | PASS |
| REQ-0011 | TC-0018 + regression | PASS |
| REQ-0012 | TC-0019 + regression | PASS |
| REQ-0013 | TC-0021 + regression | PASS |
| REQ-0014 | TC-0022 + regression | PASS |
| REQ-0015 | TC-0023 + regression | PASS |

## Red Team Sign-Off (C3)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-04T12:24:00Z |
| Evidence | commits `faee3f7`, `6f13cc2`; 666 tests (120 files) |
| LINKED_REQ | REQ-0009..0015 |
| Human Gate 2 | pending GATE-0006 |

EvalGate (C3): status=PASS | eval_run_id=ER-C3-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0006

---

## C4 — Invoice UI parity tranche (2026-06-04)

| Item | Value |
|------|-------|
| Cycle | C4 (draft REQs) |
| ART-IDs | ART-0086..ART-0097 |
| REQ-IDs | REQ-0016, REQ-0017 (UI); REQ-0018..0020 unchanged |
| Regression | 667/667 Vitest (120 files) |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0029 | TC-0025 | REQ-0016 | PASS | `billing-visit-fee` default €150 fallback + options-load |
| VER-0030 | TC-0025 | REQ-0016 | PASS | CP invoice DataTable + filters + visit picker amber |
| VER-0031 | TC-0026 | REQ-0017 | PASS | Invoice detail glass + linked visit + audit card |
| VER-0032 | TC-0025 | REQ-0016 | PASS | Doctor profile seed unify (`doctor-profile-seed-data.ts`) |
| VER-0033 | TC-0025..0017 | PASS | tsc + lint + build |

## Coverage (C4 draft)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0016 | TC-0025 + regression | PASS (automated) |
| REQ-0017 | TC-0026 + regression | PASS (automated) |
| REQ-0018 | — | verify-only (prior tranche) |
| REQ-0019 | — | deferred |
| REQ-0020 | — | out of scope |

## Red Team Sign-Off (C4 tranche)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-04T13:20:00Z |
| Evidence | 667 tests, tsc, lint, build PASS |
| LINKED_REQ | REQ-0016, REQ-0017 |
| Human Gate 2 | pending (C4 not archived) |

EvalGate (C4-UI): status=PASS | eval_run_id=ER-C4-UI-VERIFY | policy_version_ref=1.0.0

## C4 polish tranche (2026-06-04)

| Item | Value |
|------|-------|
| ART-IDs | ART-0098..ART-0100 |
| Regression | 671/671 Vitest (121 files) |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0034 | REQ-0016 | PASS | ClinicalGlassDatePicker + location hint |
| VER-0035 | REQ-0016 | PASS | Doctor portal invoice-table-cells parity |
| VER-0036 | REQ-0016 | PASS | db:seed-demo-full / db:seed-doctor-profiles |
| VER-0037 | REQ-0016 | PASS | tsc + lint + build |

---

## C5 — Entity detail Record Audit (2026-06-04)

| Item | Value |
|------|-------|
| Cycle | C5 |
| ART-IDs | ART-0101..ART-0125 |
| REQ-IDs | REQ-0021..REQ-0026 |
| Regression | **742/742** Vitest (138 files) |
| Commits | `9785c8d`, `d826ca7` |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0038 | TC-0027 | REQ-0021 | PASS | `entity-detail-audit-actor.test.ts` |
| VER-0039 | TC-0027 | REQ-0021 | PASS | `appointment-detail-view-model.test.ts` audit actors |
| VER-0040 | TC-0027 | REQ-0021 | PASS | Full regression 742 |
| VER-0041 | TC-0028 | REQ-0022 | PASS | Serializer + include contract (regression) |
| VER-0042 | TC-0029 | REQ-0023 | PASS | Invoice audit rows + view-model |
| VER-0043 | TC-0030 | REQ-0024 | PASS | Admin user detail SSR + mapper |
| VER-0044 | TC-0031 | REQ-0025 | PASS | Backfill script idempotent (0/0 when stamped) |
| VER-0045 | REQ-0021..0026 | PASS | tsc + lint + build |

## Coverage (C5)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0021 | TC-0027 + regression | PASS |
| REQ-0022 | TC-0028 + regression | PASS |
| REQ-0023 | TC-0029 + regression | PASS |
| REQ-0024 | TC-0030 + regression | PASS |
| REQ-0025 | TC-0031 | PASS |
| REQ-0026 | — | constraint (no VER) |

## Red Team Sign-Off (C5)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-04T18:30:00Z |
| Evidence | `9785c8d`, `d826ca7`; 742 tests |
| LINKED_REQ | REQ-0021..0025 |
| Human Gate 2 | pending GATE-0010 |

EvalGate (C5): status=PASS | eval_run_id=ER-C5-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0010

---

## C6 — Invoice violet + visit location (2026-06-05)

| Item | Value |
|------|-------|
| Cycle | C6 |
| ART-IDs | ART-0126..ART-0155 |
| REQ-IDs | REQ-0027..REQ-0031 |
| Regression | **772/772** Vitest (145 files) |
| Commits | `629c3ed`, `84967f6`, `a31bf78`, `bcfe6d4`, `636282e`, `cad0b07`, `29fd3b5` |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0046 | TC-0032 | REQ-0027 | PASS | Visit fee badge + booking fee display tests |
| VER-0047 | TC-0032 | REQ-0027 | PASS | Full regression at C6 start |
| VER-0048 | TC-0033 | REQ-0028 | PASS | Invoice detail capabilities + PDF route |
| VER-0049 | TC-0033 | REQ-0029 | PASS | Violet dialog classes + entity chrome |
| VER-0050 | TC-0034 | REQ-0030 | PASS | `appointment-visit-location.test.ts` |
| VER-0051 | TC-0035 | REQ-0031 | PASS | Doctor portal + dashboard location embed |
| VER-0052 | TC-0036 | REQ-0031 | PASS | Snapshot location resolver test |
| VER-0053 | REQ-0027..0031 | PASS | tsc + lint + build |
| VER-0054 | TC-0037 | REQ-0027..0031 | PASS | Full regression **772/772** |

## Coverage (C6)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0027 | TC-0032 + regression | PASS |
| REQ-0028 | TC-0033 + regression | PASS |
| REQ-0029 | TC-0033 + regression | PASS |
| REQ-0030 | TC-0034 + regression | PASS |
| REQ-0031 | TC-0035..0036 + regression | PASS |

## Red Team Sign-Off (C6)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-05T17:40:00Z |
| Evidence | `629c3ed`; 772 tests, tsc, lint, build |
| LINKED_REQ | REQ-0027..0031 |
| Human Gate 2 | pending GATE-0012 |

EvalGate (C6): status=PASS | eval_run_id=ER-C6-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0012
