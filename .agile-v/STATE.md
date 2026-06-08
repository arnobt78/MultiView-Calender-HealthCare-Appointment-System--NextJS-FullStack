# Agile V — Living State

<!-- Updated: 2026-06-04 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C7** (active) + **C4 billing extension** (shipped on main) |
| **Phase** | Verify |
| **Stage** | 4 — automated PASS; Human Gates pending |
| **Status** | `verify_complete` — **863/863** tests (166 files) |
| **Last Updated** | 2026-06-04 |
| **HEAD** | `d2a4cd5` |
| **Activation** | `ACTIVATION.md` + `SKILLS.md` (24) |

## Resume tomorrow (2026-06-05)

1. **Manual smoke:** doctor portal billing — issuer vs linked-owner Send menu; dialog visit parity; PDF refund date.
2. **Human Gates:** GATE-0013/0014 (C7); GATE-0007/0008 (C4) when ready to freeze.
3. **Verify:** `npm test && npx tsc --noEmit && npm run lint && npm run build`
4. **Docs:** `CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` (billing tranche current).

## Billing extension tranche (2026-06-04, main)

| Commit | Theme |
|--------|-------|
| `0194566` | Lifecycle TS + dialog visit parity |
| `0cb713d` | SSR serialize lifecycle TS |
| `37511e6` | Visit fee strip on dialog card |
| `9733e39` | Audit stamp docs |
| `cf89e05` | Doctor issuer UI gate (`doctorCanMutateInvoice`) |
| `115a6b2` | Patient/Treating/Owner list labels |
| `d2a4cd5` | PDF `refunded_at` serialize |

## Pipeline (C7)

```
Stage 1: Requirements  ✓  REQ-0034..0037 [C7]
Stage 2: Validation  ✓
[Human Gate 1]  ⏳  GATE-0013 pending
Stage 3: Synthesis  ✓  `e73a7d0` + billing extension above
Stage 4: Verification  ✓  863/863 · tsc · lint · build
[Human Gate 2]  ⏳  GATE-0014 pending
Stage 5: Acceptance  —
```

## Cycle Index

| Cycle | Archive | REQ scope | Gate 2 |
|-------|---------|-----------|--------|
| C1 | `cycles/C1/` frozen | REQ-0001..0004 | ✓ |
| C2 | `cycles/C2/` frozen | REQ-0005..0008 | ✓ |
| C3 | scaffold | REQ-0009..0015 | GATE-0006 pending |
| C4 | scaffold + **billing ext shipped** | REQ-0016..0020 + lifecycle/dialog/issuer | GATE-0008 pending |
| C5 | scaffold | REQ-0021..0026 | GATE-0010 pending |
| C6 | scaffold | REQ-0027..0033 | GATE-0012 pending |
| **C7** | living | **REQ-0034..0037** | GATE-0014 pending |
