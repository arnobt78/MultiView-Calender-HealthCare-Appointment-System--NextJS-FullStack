# Agent Instructions — HealthCal Pro

**Agile V v1.4** — Infinity Loop **ACTIVE** on every prompt.

## Mandatory load order

1. **`agile-v-core`** → 2. **`agile-v-pipeline`** → 3. **`agile-v-lifecycle`** (C2+) → 4. **`.agile-v/SKILLS.md`** → 5. **`agile-v-compliance`** (gates)

**Session:** `.agile-v/ACTIVATION.md` · **Rule:** `.cursor/rules/agile-v-infinity-loop.mdc` (always on)

## Resume

1. `.agile-v/STATE.md` — **C67 shipped** · **1404/1404** · manual QA pending
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
| C67 | — | month edit/invoice parity · en-US dates |
| C66 | — | InvoiceVisitTitleRow · cancel/refund polish |
| C65 | 0116 | shipped verify PASS |
| C64 | 0115 | shipped verify PASS |
| C63 | 0114 | shipped verify PASS |
| C62 | 0113 | shipped verify PASS |
| C61 | 0112 | shipped `a37727b` |
| C60 | 0111 | shipped `a37727b` |
| C59 | 0110 | default bookable date + local today + slot grid on open |
| C58 | 0109 | portal summary status buckets + doctor row spacing |
| C57 | 0108 | portal profile referral label + inline primary doctor |
| C56 | 0107 | patient portal Pay Now + timeline admin badge |
| C55 | 0106 | patient portal invoice + timeline polish |
| C54 | 0105 | picker + portal type+duration |
| C53 | 0104 | inline visit type on When columns |
| C52 | 0103 | due-date tones + inline badges |
| C51 | 0102 | cache-first appointments |
| C50 | 0101 | cache-first invoices |
| C49 | 0100 | stable fallbacks + admin staff href |
| C48 / C48.1 | 0099 | shipped `8ba3acf` |

**Next:** Manual QA seed v3, commit C62–C65, then **Specify C66** + **REQ-0117**.
