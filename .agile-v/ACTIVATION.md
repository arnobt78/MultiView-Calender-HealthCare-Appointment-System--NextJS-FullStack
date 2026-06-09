# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Read with STATE.md on every chat -->

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

1. `STATE.md` — cycle **C7** + **C4 billing ext**; **863/863** verify PASS
2. `CHECKPOINTS.md` — only if PENDING HITL
3. `REQUIREMENTS.md` — parent REQ before any work
4. `agile-v-core.md` — repo binding

## 3. Infinity Loop

```
Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept
         ↑___________________________________________________________|
```

## 4. Traceability

`REQ-XXXX` → `ART-XXXX` → `TC-XXXX` → `VER-XXXX` → `DECISION_LOG.md`

## 5. Current

| Cycle | REQ | Status | Gate |
|-------|-----|--------|------|
| C1–C2 | 0001..0008 | closed (frozen) | ✓ |
| C3–C6 | 0009..0033 | verify/shipped | GATE-0005..0012 pending |
| C4 ext | 0016..0018 | billing lifecycle/dialog/issuer/PDF | GATE-0007/0008 |
| **C7** | **0034..0037** | **verify PASS** | GATE-0013/0014 pending |

**Baseline:** **863** tests · **166** files · HEAD `99f13b8`

## 6. Halt if

No parent REQ · ambiguous REQ · self-verify only · skip invalidation · Gate 2 without `EVAL_RESULTS.md` PASS

## 7. Verify

`npm test && npx tsc --noEmit && npm run lint && npm run build`

## 8. Hooks

`AGENTS.md` · `.cursor/rules/agile-v-infinity-loop.mdc` · `CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md`
