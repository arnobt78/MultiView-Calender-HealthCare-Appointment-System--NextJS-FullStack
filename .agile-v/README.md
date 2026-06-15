# Agile V — HealthCal Pro

Living AQMS — **Infinity Loop ACTIVE on every prompt.**

## Quick Start

1. **`ACTIVATION.md`** + **`STATE.md`** — resume here
2. Load **`agile-v-core`** → **`agile-v-pipeline`** → **`agile-v-lifecycle`** → role (`SKILLS.md` 24) → **`agile-v-compliance`**
3. **`BOOTSTRAP.md`** — C1..C37 index + activation checklist
4. Parent **`REQ-XXXX`** in **`REQUIREMENTS.md`** before any code — **halt if missing**

## Current

| Field | Value |
|-------|-------|
| **Cycle** | C37.2 closed · **C38 specify idle** |
| **REQ range** | REQ-0001..0087 (add 0088+ for C38) |
| **Verify** | **1154/1154** · HEAD `ea40860` |
| **HITL** | CHECKPOINTS clear |

## Cycles (summary)

| Cycle | Status | REQ |
|-------|--------|-----|
| C1–C2 | archived frozen | 0001..0008 |
| C3–C34.1 | shipped | 0009..0082 |
| C35–C36.2.1 | shipped | 0083..0087 |
| C37 | shipped (no REQ) | — |
| **C38** | **specify next** | TBD |

## Hooks

`.cursor/rules/agile-v-infinity-loop.mdc` · `AGENTS.md` · `CLAUDE.md` · `.claude/SESSION.md`

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```
