# Agent Instructions — HealthCal Pro

**Agile V v1.4** — Infinity Loop **ACTIVE** on every prompt.

## Mandatory load order

1. **`agile-v-core`** → 2. **`agile-v-pipeline`** → 3. **`agile-v-lifecycle`** (C2+) → 4. **`.agile-v/SKILLS.md`** → 5. **`agile-v-compliance`** (gates)

**Session:** `.agile-v/ACTIVATION.md` · **Rule:** `.cursor/rules/agile-v-infinity-loop.mdc` (always on)

## Resume

1. `.agile-v/STATE.md` — **C53 shipped** · **1305/1305**
2. `.agile-v/CHECKPOINTS.md` if PENDING HITL (**none**)
3. Parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md` before any code (**halt if missing**)

## Engineering

`CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md`

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Cycles (recent)

| Cycle | REQ | Status |
|-------|-----|--------|
| C46 | 0097 | shipped `45c87e5` |
| C47 | 0098 | shipped `1e252b0` |
| C53 | 0104 | inline visit type on When columns |
| C52 | 0103 | due-date tones + inline badges |
| C51 | 0102 | cache-first appointments |
| C50 | 0101 | cache-first invoices |
| C49 | 0100 | stable fallbacks + admin staff href |
| C48 / C48.1 | 0099 | shipped `8ba3acf` |

**Next:** Specify **C54** — add **REQ-0105** before feature code.
