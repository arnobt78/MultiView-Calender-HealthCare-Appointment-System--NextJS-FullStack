# Agile V — Living State

<!-- Updated: 2026-06-04 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C7** (active) + **C4 billing extension** (shipped) |
| **Phase** | Verify |
| **Stage** | 4 — automated PASS; Human Gates pending |
| **Status** | `verify_complete` — **863/863** tests (166 files) |
| **Last Updated** | 2026-06-04 |
| **HEAD** | `99f13b8` |
| **Activation** | `ACTIVATION.md` + `SKILLS.md` (24) + Cursor rule restored |

## Infinity Loop (active session)

1. Load **agile-v-core** + **pipeline** + **lifecycle** + role skill + **compliance** (every prompt).
2. Parent **REQ-XXXX** before any code change.
3. Error/fix/extension → trace DECISION_LOG + BUILD_MANIFEST + verify suite.

## Resume next session

1. **Manual smoke:** doctor portal billing — issuer vs linked-owner Send; dialog visit parity; PDF refund date.
2. **Human Gates:** GATE-0013/0014 (C7); GATE-0007/0008 (C4 ext) when freezing archives.
3. **Verify:** `npm test && npx tsc --noEmit && npm run lint && npm run build`
4. **New work:** specify **C8** in `REQUIREMENTS.md` before coding.

## Billing extension (C4 ext, main)

| Commit | Theme |
|--------|-------|
| `0194566`..`d2a4cd5` | Lifecycle TS, dialog parity, issuer UI, labels, PDF |
| `99f13b8` | Agile-V state/docs refresh |

## Pipeline (C7)

```
Stage 1: Requirements  ✓  REQ-0034..0037
Stage 2: Validation  ✓
[Human Gate 1]  ⏳  GATE-0013
Stage 3: Synthesis  ✓  `e73a7d0` + C4 ext
Stage 4: Verification  ✓  863/863 · tsc · lint · build
[Human Gate 2]  ⏳  GATE-0014
Stage 5: Acceptance  —
```

## Cycle Index

| Cycle | Archive | REQ scope | Gate 2 |
|-------|---------|-----------|--------|
| C1 | `cycles/C1/` frozen | REQ-0001..0004 | ✓ |
| C2 | `cycles/C2/` frozen | REQ-0005..0008 | ✓ |
| C3 | scaffold | REQ-0009..0015 | GATE-0006 pending |
| C4 | scaffold + billing ext | REQ-0016..0020 + ext | GATE-0008 pending |
| C5 | scaffold | REQ-0021..0026 | GATE-0010 pending |
| C6 | scaffold | REQ-0027..0033 | GATE-0012 pending |
| **C7** | living | **REQ-0034..0037** | GATE-0014 pending |
