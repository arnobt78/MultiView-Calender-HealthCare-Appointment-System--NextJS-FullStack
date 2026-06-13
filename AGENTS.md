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

1. `.agile-v/STATE.md` — cycle **C30** shipped, verify PASS **1057/1057**
2. `.agile-v/CHECKPOINTS.md` if PENDING HITL (none)
3. Parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md` before any work

## Living artifacts

`STATE.md` · `REQUIREMENTS.md` (REQ-0001..0078) · `BUILD_MANIFEST.md` · `TEST_SPEC.md` · `VALIDATION_SUMMARY.md` · `DECISION_LOG.md` · `BOOTSTRAP.md` · `SKILLS.md`

## Engineering

`CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` — queryKeys, invalidation, SSR, RBAC.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Cycles (recent)

| Cycle | REQ | Status | Gates |
|-------|-----|--------|-------|
| C26–C29 | 0070..0077 | verify/shipped | pending |
| **C30** | **0078** | **verify PASS** | gate TBD |

**Next:** approve pending gates → archive C3–C30 → specify **C31** before new code.
