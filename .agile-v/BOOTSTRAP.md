# Agile V Bootstrap — HealthCal Pro

<!-- Framework initialization + cycle index | Agile V v1.4 | Last refresh: 2026-06-04 (C5 bootstrap) -->

## Infinity Loop (SCOPE-V)

```
Specify → Constrain → Orchestrate → Prove → Evolve → Verify
         ↑___________________________________________|
              (CR / verification failure → re-entry)
```

| SCOPE-V Phase | Pipeline Stage | Primary agents | Living artifact |
|---------------|----------------|----------------|-----------------|
| Specify | 1 — Requirements | requirement-architect, discovery-analyst, threat-modeler, ux-spec-author | `REQUIREMENTS.md`, `phases/01-specify/` |
| Constrain | 2 — Validation | logic-gatekeeper | `phases/02-constrain/`, Gate 1 → `APPROVALS.md` |
| Orchestrate | 3 — Synthesis | build-agent-js, test-designer | `BUILD_MANIFEST.md`, `TEST_SPEC.md`, `phases/03-synthesize/` |
| Prove | 3–4 | build-agent (manifest), compliance-auditor | `BUILD_MANIFEST.md`, `TRACE_LOG.md` |
| Evolve | All | compliance-auditor, agile-v-lifecycle | `DECISION_LOG.md`, `CHANGE_LOG.md` |
| Verify | 4 — Verification | red-team-verifier | `VALIDATION_SUMMARY.md`, `EVAL_RESULTS.md`, `phases/04-verify/` |

**Load order:** `agile-v-core` → `agile-v-pipeline` (+ `agile-v-lifecycle` on C2+) → role skill → `agile-v-compliance` at gates. Full registry: `SKILLS.md` (24 skills).

---

## Framework Initialization Checklist (one-time + per cycle)

| # | Artifact / directory | Purpose | Status |
|---|----------------------|---------|--------|
| 1 | `.agile-v/` root | AQMS living workspace | ✓ |
| 2 | `config.json` | Project metadata, cycle, authority matrix, verification commands | ✓ |
| 3 | `POLICY.yaml` | Policy-as-code (versioned) | ✓ v1.0.0 |
| 4 | `STATE.md` | Current cycle, phase, stage — **read first on resume** | ✓ |
| 5 | `REQUIREMENTS.md` | Canonical REQ-XXXX + traceability index | ✓ REQ-0001..0026 |
| 6 | `BUILD_MANIFEST.md` | ART-XXXX → code paths | ✓ ART-0001..0085 |
| 7 | `TEST_SPEC.md` | TC-XXXX (requirements-derived) | ✓ TC-0001..0024 |
| 8 | `VALIDATION_SUMMARY.md` | VER-XXXX results + EvalGate lines | ✓ |
| 9 | `ATM.md` | REQ → ART → VER matrix | ✓ |
| 10 | `DECISION_LOG.md` | Append-only decisions | ✓ |
| 11 | `CHANGE_LOG.md` | CR-XXXX change requests | ✓ |
| 12 | `EVAL_RESULTS.md` | Eval flywheel; Gate 2 prerequisite | ✓ |
| 13 | `CHECKPOINTS.md` | Durable HITL interrupts | ✓ |
| 14 | `TRACE_LOG.md` | Append-only policy/tool spans | ✓ |
| 15 | `APPROVALS.md` | Human Gate records | ✓ GATE-0001..0006 |
| 16 | `RISK_REGISTER.md` | Cycle-tagged risks | ✓ |
| 17 | `CAPA_LOG.md` | Corrective/preventive actions | ✓ |
| 18 | `REVALIDATION_LOG.md` | Model/platform revalidation | ✓ |
| 19 | `BOOTSTRAP.md` | This file — init + cycle index | ✓ |
| 20 | `README.md` | Quick start for agents/humans | ✓ |
| 21 | `SKILLS.md` | 24 companion skills registry | ✓ |
| 22 | `phases/01-specify/` … `05-acceptance/` | PLAN + SUMMARY + CONTEXT per SCOPE-V phase | ✓ |
| 23 | `cycles/C1/`, `C2/` | Frozen archives (immutable) | ✓ |
| 24 | `cycles/C3/README.md` | Active cycle archive scaffold | ✓ (freeze on GATE-0006) |
| 25 | `cycles/C4/README.md` | Invoice tranche (gates pending) | ✓ |
| 26 | `cycles/C5/README.md` | Record Audit active cycle | ✓ |
| 27 | `agile-v-core.md` | Project-local core binding | ✓ |
| 28 | `AGENTS.md` (repo root) | Agent load order + resume | ✓ |
| 29 | `.cursor/rules/agile-v-infinity-loop.mdc` | Always-on Cursor rule | ✓ |

---

## C1 Bootstrap (2026-05-30) — Framework + Category Tranche

| Step | Artifact | Status |
|------|----------|--------|
| 1 | Directory + `POLICY.yaml` + `config.json` | ✓ |
| 2 | Living docs (STATE, REQUIREMENTS, BUILD_MANIFEST, TEST_SPEC, VALIDATION_SUMMARY, ATM) | ✓ |
| 3 | Runtime (EVAL_RESULTS, CHECKPOINTS, TRACE_LOG, APPROVALS, CAPA, RISK, CHANGE, REVALIDATION) | ✓ |
| 4 | Phase `01-specify` PLAN/SUMMARY/CONTEXT | ✓ |
| 5 | `SKILLS.md` (24 agents) | ✓ |
| 6 | Phases `02`–`05` scaffold | ✓ |
| 7 | REQ-0001..0004 → Gate 1 (GATE-0001) → build → Gate 2 (GATE-0002) | ✓ closed |
| 8 | Archive `.agile-v/cycles/C1/` | ✓ frozen — **do not modify** |

**C1 scope:** Category CP parity, invalidation hardening, SSR prefetch, calendar batch assignees.  
**Evidence:** `3a563d7`, 472/472 tests, ER-C1-CLOSE.

---

## C2 Bootstrap (2026-05-31) — Doctor CP + Invalidation Tranche

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0005..0008 in living `REQUIREMENTS.md` | ✓ |
| 2 | ART-0034..0048 in `BUILD_MANIFEST.md` | ✓ |
| 3 | TC-0010..0015 + VER-0013..0018 | ✓ |
| 4 | Gate 1 (GATE-0003) → Gate 2 (GATE-0004) | ✓ closed |
| 5 | Archive `.agile-v/cycles/C2/` | ✓ frozen |

**Evidence:** `2d9a932`, 520/520 tests, ER-C2-CLOSE.

---

## C3 Bootstrap (2026-06-01 → extension 2026-06-02) — Calendar, filters, billing, insights

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0009..0015 in living `REQUIREMENTS.md` | ✓ `approved [C3]` |
| 2 | ART-0049..0085 in `BUILD_MANIFEST.md` | ✓ |
| 3 | TC-0016..0024 + VER-0019..0028 | ✓ |
| 4 | Code on `main` (scope, filters, billing KPI, telehealth period, invoice grid) | ✓ `faee3f7`, `6f13cc2` |
| 5 | Human Gate 1 (GATE-0005) | ⏳ pending |
| 6 | Automated verification | ✓ **742/742** tests (138 files), tsc, lint, build |
| 7 | Human Gate 2 (GATE-0006) → archive `cycles/C3/` | ⏳ pending |

**Note:** Re-running “bootstrap C1” only reads `cycles/C1/` — living C1 docs are not rewritten.

---

## C4 Bootstrap (2026-06-04) — Invoice + notifications tranche

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0016..0020 `approved [C4]` | ✓ shipped on main |
| 2 | ART-0086..0100 | ✓ |
| 3 | Gates GATE-0007/0008 | ⏳ pending archive |

---

## C5 Bootstrap (2026-06-04) — Record Audit (active)

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0021..0026 in `REQUIREMENTS.md` | ✓ `approved [C5]` |
| 2 | ART-0101..0125 in `BUILD_MANIFEST.md` | ✓ |
| 3 | Code on `main` | ✓ `9785c8d`, `d826ca7` |
| 4 | `db:backfill-user-audit` + seed stamp | ✓ |
| 5 | Automated verify | ✓ **742/742** |
| 6 | Gates GATE-0009/0010 | ⏳ pending |

---

## Cycle Index

| Cycle | Scope | REQ-IDs | Gate 2 commit | Archive |
|-------|-------|---------|---------------|---------|
| C1 | Category CP + SSR prefetch | REQ-0001..0004 | `3a563d7` | `cycles/C1/` (frozen) |
| C2 | Doctor CP + admin roster + dev stubs | REQ-0005..0008 | `2d9a932` | `cycles/C2/` (frozen) |
| C3 | Calendar, filters, billing KPI | REQ-0009..0015 | pending GATE-0006 | `cycles/C3/` |
| C4 | Invoice dialog, detail, RBAC, badges, SSE | REQ-0016..0020 | pending GATE-0008 | `cycles/C4/` |
| C5 | **Record Audit** (active) | REQ-0021..0026 | pending GATE-0010 | `cycles/C5/` |

---

## Next Actions (tomorrow)

1. Approve **GATE-0005..0010** in `APPROVALS.md` as cycles close.
2. Archive C3 → `cycles/C3/`; C4 → `cycles/C4/`; C5 → `cycles/C5/` after Gate 2.
3. Optional new REQ-0027: portal `/admins/[id]` Record Audit.
4. New work: specify **C6** in `REQUIREMENTS.md` before coding.

## Verification (default)

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Current baseline: **742** tests, **138** files (2026-06-04).
