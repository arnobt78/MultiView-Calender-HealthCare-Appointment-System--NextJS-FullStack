# Agile V — HealthCal Pro

Living AQMS — **Infinity Loop ACTIVE on every prompt.**

## Quick Start

1. **`ACTIVATION.md`** + **`STATE.md`** — resume here
2. Load **`agile-v-core`** → **`agile-v-pipeline`** → **`agile-v-lifecycle`** → role (`SKILLS.md` 24) → **`agile-v-compliance`**
3. **`PLAYBOOK.md`** — pipeline + halt rules + verify
4. **`BOOTSTRAP.md`** — C1..C42 index + activation checklist
5. Parent **`REQ-XXXX`** in **`REQUIREMENTS.md`** before any code — **halt if missing**

## Current

| Field | Value |
|-------|-------|
| **Cycle** | C42.2 shipped · **C43 specify idle** |
| **REQ range** | REQ-0001..0093 (add 0094+ for C43) |
| **Verify** | **1220/1220** · HEAD `eb3d576` |
| **HITL** | CHECKPOINTS clear |

## Cycles (summary)

| Cycle | Status | REQ |
|-------|--------|-----|
| C1–C2 | archived frozen | 0001..0008 |
| C3–C37.2 | shipped | 0009..0087 |
| C38–C39.2 | shipped | 0088..0090 |
| C40–C42.2 | shipped | 0091..0093 |
| **C43** | **specify next** | TBD |

## Hooks

`.cursor/rules/agile-v-infinity-loop.mdc` · `AGENTS.md` · `CLAUDE.md` · `.claude/SESSION.md`

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```
