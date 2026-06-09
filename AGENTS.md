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

1. `.agile-v/STATE.md` — cycle **C7** + C4 ext, verify PASS **863/863**
2. `.agile-v/CHECKPOINTS.md` if PENDING HITL
3. Parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md` before any work

## Living artifacts

`STATE.md` · `REQUIREMENTS.md` (REQ-0001..0037) · `BUILD_MANIFEST.md` · `TEST_SPEC.md` · `VALIDATION_SUMMARY.md` · `DECISION_LOG.md` · `BOOTSTRAP.md` · `SKILLS.md`

## Engineering

`CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` — queryKeys, invalidation, SSR, RBAC.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Cycles

| Cycle | REQ | Status | Gates |
|-------|-----|--------|-------|
| C1–C2 | 0001..0008 | closed | ✓ |
| C3–C6 | 0009..0033 | verify/shipped | 0005..0012 pending |
| C4 ext | 0016..0018 | billing ext shipped | 0007/0008 pending |
| **C7** | **0034..0037** | **verify PASS** | **0013/0014 pending** |

**Next:** approve gates → archive → specify **C8** before new code.
