# Agile V — HealthCal Pro

Living AQMS — **Agile V Infinity Loop** on this repository.

## Quick Start (every session)

1. **Read** `STATE.md` — cycle **C5**, stage 4 verify PASS
2. **Read** `agile-v-core.md` + load skill `agile-v-core`
3. **Registry** `SKILLS.md` — 24 agents
4. **Bootstrap** `BOOTSTRAP.md` — C1..C5 index

## Cycles

| Cycle | Status | REQ-IDs | Archive |
|-------|--------|---------|---------|
| C1 | closed | REQ-0001..0004 | `cycles/C1/` frozen |
| C2 | closed | REQ-0005..0008 | `cycles/C2/` frozen |
| C3 | verify PASS | REQ-0009..0015 | `cycles/C3/` · gates 5–6 pending |
| C4 | shipped | REQ-0016..0020 | `cycles/C4/` · gates 7–8 pending |
| **C5** | **active** | REQ-0021..0026 | `cycles/C5/` · gates 9–10 pending |

## Activation

- `.cursor/rules/agile-v-infinity-loop.mdc` (`alwaysApply: true`)
- `AGENTS.md` — load order + resume
- `.agile-v/agile-v-core.md` — project binding

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

**742** tests · **138** files (2026-06-04)
