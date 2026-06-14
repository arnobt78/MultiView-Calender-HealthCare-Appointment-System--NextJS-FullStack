# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Sync: 2026-06-13 C34.1 -->

## 1. Load skills (mandatory)

| # | Skill | When |
|---|-------|------|
| 1 | `agile-v-core` | Always first |
| 2 | `agile-v-pipeline` | Always |
| 3 | `agile-v-lifecycle` | C2+ / archive / CR |
| 4 | Role from `SKILLS.md` | By stage |
| 5 | `agile-v-compliance` | Gates, risk, CAPA |

**24 agents:** `.agile-v/SKILLS.md`

## 2. Read (resume)

1. `STATE.md` — **C34.1 shipped** · **1103/1103** verify PASS · HEAD `768a422`
2. `CHECKPOINTS.md` — only if PENDING HITL (**none**)
3. `REQUIREMENTS.md` — parent REQ before any work (**REQ-0001..0082**)

## 3. Before coding (mandatory gate)

1. Read `STATE.md` + `CHECKPOINTS.md` (halt if PENDING HITL).
2. Resolve parent `REQ-XXXX` in `REQUIREMENTS.md` — **halt if missing**.
3. Run stage: **Specify** → **Constrain** → only then **Orchestrate**.
4. On CRUD: `queryKeys` + invalidation helpers — no hardcoded keys.
5. After synthesis: **Prove** → **Verify** (`npm test && tsc && lint && build`) — Red Team, not self-sign-off.

## 4. Infinity Loop

```
Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept
         ↑___________________________________________________________|
```

## 5. Traceability

`REQ-XXXX` → `ART-XXXX` → `TC-XXXX` → `VER-XXXX` → `DECISION_LOG.md`

## 6. Current cycle index

| Cycle | REQ | Status | Gate |
|-------|-----|--------|------|
| C1–C2 | 0001..0008 | closed (frozen) | ✓ |
| C3–C30 | 0009..0078 | verify/shipped | pending |
| C31 | 0079 | verify PASS | pending |
| C32 | 0080 | verify PASS | pending |
| C33 | 0081 | verify PASS | pending |
| **C34 / C34.1** | **0082** | **verify PASS** | pending |

**Baseline:** **1103** tests · **223** files · HEAD **`768a422`** · verified 2026-06-13

**Next:** Human Gate backlog → archive C3–C34 → **Specify C35** (new REQ) before new code.

## 7. Halt if

No parent REQ · ambiguous REQ · self-verify only · skip invalidation · Gate 2 without `EVAL_RESULTS.md` PASS

## 8. Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## 9. Hooks

`AGENTS.md` · `.cursor/rules/agile-v-infinity-loop.mdc` · `CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md`
