# Agile V — HealthCal Pro

Living AQMS — **Agile V Infinity Loop** on this repository.

## Quick Start (every session)

1. **Read** `ACTIVATION.md` + `STATE.md` — cycle **C6**, verify PASS
2. Load skill `agile-v-core` + `agile-v-pipeline`
3. **Registry** `SKILLS.md` — 24 agents
4. **Bootstrap** `BOOTSTRAP.md` — C1..C6 index

## Cycles

| Cycle | Status | REQ-IDs | Archive |
|-------|--------|---------|---------|
| C1 | closed | REQ-0001..0004 | `cycles/C1/` frozen |
| C2 | closed | REQ-0005..0008 | `cycles/C2/` frozen |
| C3 | verify PASS | REQ-0009..0015 | gates 5–6 pending |
| C4 | shipped | REQ-0016..0020 | gates 7–8 pending |
| C5 | verify PASS | REQ-0021..0026 | gates 9–10 pending |
| **C6** | **active** | REQ-0027..0031 | gates 11–12 pending |

## Activation

- `.cursor/rules/agile-v-infinity-loop.mdc` (`alwaysApply: true`)
- `AGENTS.md` — load order + resume
- `.agile-v/agile-v-core.md` — project binding

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

**772** tests · **145** files (2026-06-05)
