# Agile V Bootstrap — HealthCal Pro

<!-- Framework initialization + cycle index | Agile V v1.4 | Last refresh: 2026-06-11 (C30 activation) -->

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
| 5 | `REQUIREMENTS.md` | Canonical REQ-XXXX + traceability index | ✓ REQ-0001..0078 |
| 6 | `BUILD_MANIFEST.md` | ART-XXXX → code paths | ✓ ART-0001..0406 |
| 7 | `TEST_SPEC.md` | TC-XXXX (requirements-derived) | ✓ TC-0001..0052 |
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
| 26 | `cycles/C5/README.md` | Record Audit cycle | ✓ |
| 27 | `cycles/C6/README.md` | Invoice violet + location | ✓ |
| 28 | `cycles/C7/README.md` | Services + cancel + cron + phone | ✓ |
| 29 | `cycles/C8/README.md` | Page chrome + portal chrome (active) | ✓ |
| 30 | `agile-v-core.md` | Project-local core binding | ✓ |
| 31 | `AGENTS.md` (repo root) | Agent load order + resume | ✓ |
| 32 | `.cursor/rules/agile-v-infinity-loop.mdc` | Always-on Cursor rule | ✓ always on |

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

## C4 Bootstrap (2026-06-04) — Invoice + notifications + billing extension

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0016..0020 `approved [C4]` | ✓ shipped on main |
| 2 | ART-0086..0100 + ART-0193..0201 (billing ext) | ✓ |
| 3 | CR-C4-BILLING-EXT lifecycle/dialog/issuer/PDF | ✓ `d2a4cd5` |
| 4 | ER-C4-BILLING-EXT 863/863 | ✓ |
| 5 | Gates GATE-0007/0008 | ⏳ pending archive |

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
| C5 | Record Audit | REQ-0021..0026 | pending GATE-0010 | `cycles/C5/` |
| C6 | Invoice violet + location + REQ-0032/0033 | REQ-0027..0033 | pending GATE-0012 | `cycles/C6/` |
| C7 | Services + cancel + cron + phone | REQ-0034..0037 | pending GATE-0014 | `cycles/C7/` |
| C8/C8.1/C9 | Page chrome + portal chrome | REQ-0038..0045 | gate TBD | `cycles/C8/` |
| C10–C10.2 | CP zero-flash SSR + chrome extension | REQ-0046..0053 | pending | living |
| C11 | Global isMounted parity | REQ-0054 | pending | living |
| C12–C12.2 | CP chrome subtitle + tab isolation | REQ-0055..0057 | pending | living |
| C13 | User-admin UI parity | REQ-0059 | pending | living |
| C14–C15 | Entity detail chrome + spacing | REQ-0060..0061 | pending | living |
| C16 | User-admin violet glass | REQ-0062 | pending | living |
| **C17** | Admin table columns + footer interactives | REQ-0063 | gate TBD | living |
| C18–C22 | Org CP list/detail/dialog/billing/audit | REQ-0064..0065 | pending | living |
| C23–C23.1 | Org members parity + filter toolbar | REQ-0066..0067 | pending | living |
| C24 | Rich filter dropdowns | REQ-0068 | pending | living |
| **C25** | **Filter label DRY + DoctorFilterSelect** (active) | REQ-0069 | gate TBD | living |

---

## C6 Bootstrap (2026-06-05) — Invoice violet + visit location

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0027..0031 in `REQUIREMENTS.md` | ✓ `approved [C6]` |
| 2 | ART-0126..0155 in `BUILD_MANIFEST.md` | ✓ |
| 3 | TC-0032..0037 + VER-0046..0054 | ✓ |
| 4 | Code on `main` | ✓ `629c3ed` |
| 5 | Automated verify | ✓ **772/772** |
| 6 | Gates GATE-0011/0012 | ⏳ pending |
| 7 | Cursor rule `.cursor/rules/agile-v-infinity-loop.mdc` | ✓ restored |

---

## C7 Bootstrap (2026-06-08) — Services + cancel + cron + patient phone (active)

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0034..0037 in `REQUIREMENTS.md` | ✓ `approved [C7]` |
| 2 | ART-0169..0192 in `BUILD_MANIFEST.md` | ✓ |
| 3 | TC-0038..0043 + VER-0061..0068 | ✓ |
| 4 | Code on `main` | ✓ `dcd4374`, `e73a7d0` |
| 5 | Automated verify | ✓ **829/829** |
| 6 | Gates GATE-0013/0014 | ⏳ pending |
| 7 | Cursor rule restored | ✓ |

## C8 Bootstrap (2026-06-09) — Unified page chrome + admin portal

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0038..0040 in `REQUIREMENTS.md` | ✓ `approved [C8]` |
| 2 | ART-0202..0216 in `BUILD_MANIFEST.md` | ✓ |
| 3 | Code on `main` | ✓ `52ba8f8+` |
| 4 | Automated verify | ✓ **863/863** |
| 5 | Gates | ⏳ TBD |

## C8.1 / C9 Bootstrap (2026-06-09) — Merged CP header + portal chrome

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0041..0045 in `REQUIREMENTS.md` | ✓ `approved [C8.1/C9]` |
| 2 | ART-0217..0223 in `BUILD_MANIFEST.md` | ✓ |
| 3 | Code on `main` | ✓ `bc97070` |
| 4 | Automated verify | ✓ **863/863** (re-verified 2026-06-10) |
| 5 | `cycles/C8/README.md` scaffold | ✓ |
| 6 | Gates | ⏳ TBD |

## C10 Bootstrap (2026-06-10) — CP zero-flash SSR + entity list shell

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0046..0049 in `REQUIREMENTS.md` | ✓ `approved [C10]` |
| 2 | ART-0224..0238 in `BUILD_MANIFEST.md` | ✓ |
| 3 | Automated verify | ✓ **863/863** |

## C10.1 / C10.2 Bootstrap — CP chrome extension + gap closure

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0050..0053 | ✓ shipped |
| 2 | ART-0239..0262 | ✓ |

## C11–C13 Bootstrap — isMounted parity, chrome polish, user-admin

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0054..0057, REQ-0059 | ✓ shipped |
| 2 | ART-0263..0292 | ✓ |

## C14–C16 Bootstrap — entity detail + user-admin violet glass

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0060..0062 | ✓ shipped |
| 2 | ART-0293..0309 | ✓ |

## C17 Bootstrap (2026-06-10) — Admin table columns + footer interactives (active)

| Step | Artifact | Status |
|------|----------|--------|
| 1 | REQ-0063 in `REQUIREMENTS.md` | ✓ `approved [C17]` |
| 2 | ART-0310..0313 in `BUILD_MANIFEST.md` | ✓ |
| 3 | Code on `main` | ✓ `5d16082` |
| 4 | Automated verify | ✓ **940/940** (185 files), tsc, lint, build |
| 5 | Gates | ⏳ TBD |

## Next Actions

1. Approve **GATE-0005..0014** + C8–C30 gates in `APPROVALS.md` as cycles close.
2. Archive C3–C30 → `cycles/CN/` after each Gate 2.
3. New work: specify **C31** in `REQUIREMENTS.md` before coding.

## Verification (default)

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Current baseline: **1057** tests, **213** files (2026-06-11) · HEAD `fe84f2b`.

---

## Infinity Loop Session Activation (2026-06-11 — C30 refresh)

| Step | Artifact | Status |
|------|----------|--------|
| 1 | Load agile-v-core + pipeline + lifecycle + SKILLS.md | ✓ |
| 2 | STATE.md C30 shipped · CHECKPOINTS clear | ✓ |
| 3 | REQUIREMENTS REQ-0001..0078 · BUILD_MANIFEST ART-0406 | ✓ |
| 4 | EVAL_RESULTS ER-C30-VERIFY PASS | ✓ |
| 5 | Verify npm test 1057/1057 tsc lint build | ✓ |
| 6 | `.cursor/rules/agile-v-infinity-loop.mdc` always on | ✓ |
| 7 | `CHECKPOINTS.md` — no PENDING HITL | ✓ |
