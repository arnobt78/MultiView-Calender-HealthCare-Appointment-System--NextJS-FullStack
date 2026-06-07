# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Read with STATE.md on every chat -->

## 1. Load skills (mandatory order)

| # | Skill | When |
|---|-------|------|
| 1 | `agile-v-core` | Always first |
| 2 | `agile-v-pipeline` | Always |
| 3 | `agile-v-lifecycle` | C2+ / archive / CR |
| 4 | Role from `SKILLS.md` | By pipeline stage |
| 5 | `agile-v-compliance` | Gates, risk, CAPA |

**24 agents:** `.agile-v/SKILLS.md`

## 2. Read files (resume)

1. `STATE.md` — cycle **C6**, stage 4 verify PASS
2. `CHECKPOINTS.md` — only if PENDING HITL
3. `REQUIREMENTS.md` — parent REQ before any work
4. `agile-v-core.md` — repo binding + engineering rules

## 3. Infinity Loop

```
Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept
         ↑___________________________________________________________|
```

## 4. Traceability chain

`REQ-XXXX` → `ART-XXXX` (`BUILD_MANIFEST.md`) → `TC-XXXX` (`TEST_SPEC.md`) → `VER-XXXX` (`VALIDATION_SUMMARY.md`) → `DECISION_LOG.md`

## 5. Current position

| Cycle | REQ | Status | Gate |
|-------|-----|--------|------|
| C3 | 0009..0015 | verify PASS | GATE-0005/0006 pending |
| C4 | 0016..0020 | shipped | GATE-0007/0008 pending |
| C5 | 0021..0026 | verify PASS | GATE-0009/0010 pending |
| **C6** | **0027..0031** | **active verify PASS** | GATE-0011/0012 pending |

**Baseline:** **772** tests · **145** files · commit `629c3ed`

## 6. Halt if

- No parent REQ · ambiguous REQ · self-verify only · skip invalidation · Gate 2 without `EVAL_RESULTS.md` PASS

## 7. Verify before done

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## 8. Cursor / repo hooks

- `AGENTS.md` (repo root)
- `.cursor/rules/agile-v-infinity-loop.mdc` (`alwaysApply: true`)
- `CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` (engineering)
