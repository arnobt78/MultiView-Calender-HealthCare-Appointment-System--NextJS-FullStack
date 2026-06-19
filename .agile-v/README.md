# Agile V — HealthCal Pro

Living AQMS — **Infinity Loop ACTIVE on every prompt.**

## Quick Start

1. **`ACTIVATION.md`** + **`STATE.md`** — resume here
2. Load **`agile-v-core`** → **`agile-v-pipeline`** → **`agile-v-lifecycle`** → role (`SKILLS.md` 24) → **`agile-v-compliance`**
3. **`PLAYBOOK.md`** — pipeline + halt rules + verify
4. **`BOOTSTRAP.md`** — C1..C61.1 index + activation checklist
5. Parent **`REQ-XXXX`** in **`REQUIREMENTS.md`** before any code — **halt if missing**

## Current

| Field | Value |
|-------|-------|
| **Cycle** | C61.1 shipped · **C62 specify idle** |
| **REQ range** | REQ-0001..0112 (add **0113+** for C62) |
| **Verify** | **1356/1356** · HEAD `1873fd5` · feature `a37727b` |
| **HITL** | manual QA pending · CHECKPOINTS clear |

## Cycles (summary)

| Cycle | Status | REQ |
|-------|--------|-----|
| C1–C2 | archived frozen | 0001..0008 |
| C3–C48.1 | shipped | 0009..0099 |
| C49–C59 | shipped | 0100..0110 |
| C60–C61.1 | shipped | 0111..0112 |
| **C62** | **specify next** | REQ-0113 TBD |

## Hooks

`.cursor/rules/agile-v-infinity-loop.mdc` · `AGENTS.md` · `CLAUDE.md` · `.claude/SESSION.md`

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```
