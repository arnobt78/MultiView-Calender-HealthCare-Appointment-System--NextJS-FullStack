# Agent Instructions — HealthCal Pro

**Agile V v1.4** — Infinity Loop on **every** prompt.

## Mandatory load order

1. **`agile-v-core`** — values, SCOPE-V, traceability, halt conditions
2. **`agile-v-pipeline`** — 5-stage workflow, handoffs, checkpoints
3. **`agile-v-lifecycle`** — C2+ archive / change requests
4. **Role skill** — `.agile-v/SKILLS.md` (24 agents)
5. **`agile-v-compliance`** — Human Gates, risk/CAPA, Gate 2 close

**Session:** `.agile-v/ACTIVATION.md` · **Rule:** `.cursor/rules/agile-v-infinity-loop.mdc` (always on)

## Resume

1. `.agile-v/STATE.md` — **C34.1 shipped**, verify PASS **1103/1103**, HEAD `768a422`
2. `.agile-v/CHECKPOINTS.md` if PENDING HITL (none)
3. Parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md` before any work

## Living artifacts

`STATE.md` · `REQUIREMENTS.md` (REQ-0001..0082) · `BUILD_MANIFEST.md` · `TEST_SPEC.md` · `VALIDATION_SUMMARY.md` · `DECISION_LOG.md` · `BOOTSTRAP.md` · `SKILLS.md`

## Engineering

`CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` — queryKeys, invalidation, SSR, RBAC.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Cycles (recent)

| Cycle | REQ | Status | Gates |
|-------|-----|--------|-------|
| C31 | 0079 | verify PASS | pending |
| C32 | 0080 | verify PASS | pending |
| C33 | 0081 | verify PASS | pending |
| **C34 / C34.1** | **0082** | **verify PASS** | pending |

**Next:** approve pending gates → archive C3–C34 → specify **C35** before new code.
