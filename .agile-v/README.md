# Agile V — HealthCal Pro

Living AQMS for the **Agile V Infinity Loop** on this repository.

## Quick Start

1. **Read** `STATE.md` — current cycle, stage, status.
2. **Read** `BOOTSTRAP.md` — C1/C2 index + infinity loop.
3. **Read** `SKILLS.md` — 24 agent skills + pipeline mapping.
4. **Specify** — add `REQ-XXXX` to `REQUIREMENTS.md` (`new [C3]`).
5. **Gate 1** → `APPROVALS.md` → **Build** → `BUILD_MANIFEST.md` / `TEST_SPEC.md`.
6. **Verify** → `VALIDATION_SUMMARY.md` + `EVAL_RESULTS.md`.
7. **Gate 2** → archive `cycles/C3/`.

## File Map

| File | Purpose |
|------|---------|
| `STATE.md` | Current phase/stage/status — read first on resume |
| `BOOTSTRAP.md` | Framework init + cycle index |
| `SKILLS.md` | 24 companion skills registry |
| `REQUIREMENTS.md` | Canonical REQ-XXXX list |
| `BUILD_MANIFEST.md` | ART-XXXX → code paths |
| `TEST_SPEC.md` | TC-XXXX test design |
| `VALIDATION_SUMMARY.md` | VER results + EvalGate |
| `EVAL_RESULTS.md` | Eval flywheel; Gate 2 prerequisite |
| `ATM.md` | REQ → ART → VER traceability |
| `DECISION_LOG.md` | Append-only decisions |
| `phases/01`–`05/` | SCOPE-V phase PLAN/SUMMARY/CONTEXT |
| `cycles/C1/`, `C2/` | Frozen archives (read-only) |

## Cycles

| Cycle | Status | REQ-IDs | Archive |
|-------|--------|---------|---------|
| C1 | closed | REQ-0001..0004 | `cycles/C1/` |
| C2 | closed | REQ-0005..0008 | `cycles/C2/` |
| C3 | verify (retroactive) | REQ-0009..0012 | `cycles/C3/` (living) |

## Verification

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

Initialized: **2026-05-30** | Bootstrap completed: **2026-06-02** | Policy: **1.0.0** | Active: **C3** (Gates 5–6 pending)
