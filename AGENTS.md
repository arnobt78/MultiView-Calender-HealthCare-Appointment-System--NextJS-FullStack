# Agent Instructions — HealthCal Pro

**Agile V v1.4** — Infinity Loop on **every** prompt.

## Mandatory load order

1. **`agile-v-core`** → 2. **`agile-v-pipeline`** → 3. **`agile-v-lifecycle`** (C2+) → 4. **`.agile-v/SKILLS.md`** → 5. **`agile-v-compliance`**

**Session:** `.agile-v/ACTIVATION.md` · **Rule:** `.cursor/rules/agile-v-infinity-loop.mdc`

## Resume

1. `.agile-v/STATE.md` — **C37.2 shipped**, verify **1154/1154**, HEAD `bb17816`
2. `.agile-v/CHECKPOINTS.md` if PENDING HITL (none)
3. Parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md` before any work

## Engineering

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `.claude/SESSION.md` — queryKeys, invalidation, SSR, RBAC, auth nav.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Cycles (recent)

| Cycle | REQ | Status |
|-------|-----|--------|
| C34 / C34.1 | 0082 | verify PASS |
| C35 / C35.1 | 0083 | verify PASS |
| C36–C36.2.1 | 0084–0087 | verify PASS |
| **C37 / C37.1 / C37.2** | **—** | **shipped (auth nav UX)** |

**Next:** approve pending gates → archive → **Specify C38** before new code.
