# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Read with STATE.md on every chat | Activated: 2026-06-12 -->

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

1. `STATE.md` — cycle **C22** shipped; **975/975** verify PASS
2. `CHECKPOINTS.md` — only if PENDING HITL (none)
3. `REQUIREMENTS.md` — parent REQ before any work (REQ-0001..0065)
4. `agile-v-core.md` — repo binding

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

## 6. Current

| Cycle | REQ | Status | Gate |
|-------|-----|--------|------|
| C1–C2 | 0001..0008 | closed (frozen) | ✓ |
| C3–C17 | 0009..0063 | verify/shipped | GATE-0005..TBD pending |
| C18–C18.1 | 0064..0065 | verify/shipped | pending |
| C19–C19.1 | 0064..0065 | verify/shipped | pending |
| C20–C22 | 0065 | verify/shipped | pending |
| **C22** | **0065** | **verify PASS** | gate TBD |

**Baseline:** **975** tests · **195** files · HEAD `24aa910` · verified 2026-06-12

**Next:** Human Gate backlog → archive C3–C22 → **Specify C23** (new REQ) before new code.

## 7. Halt if

No parent REQ · ambiguous REQ · self-verify only · skip invalidation · Gate 2 without `EVAL_RESULTS.md` PASS

## 8. Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## 9. Hooks

`AGENTS.md` · `.cursor/rules/agile-v-infinity-loop.mdc` · `CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md`
