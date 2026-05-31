# Agile V — HealthCal Pro

Living AQMS state for the **Agile V Infinity Loop** on this repository.

## Quick Start

1. **Read** `STATE.md` — current cycle, stage, status.
2. **Specify** — add `REQ-XXXX` to `REQUIREMENTS.md` from your instruction.
3. **Gate 1** — Human approves requirements → `APPROVALS.md`.
4. **Build + Test** — register artifacts in `BUILD_MANIFEST.md`, tests in `TEST_SPEC.md`.
5. **Verify** — Red Team runs TCs → `VALIDATION_SUMMARY.md` + `EVAL_RESULTS.md`.
6. **Gate 2** — Human approves release when `eval_gate_status` is PASS or WAIVED.

## File Map

| File | Purpose |
|------|---------|
| `STATE.md` | Current phase/stage/status — read first on resume |
| `REQUIREMENTS.md` | Canonical REQ-XXXX list |
| `BUILD_MANIFEST.md` | ART-XXXX → code paths |
| `TEST_SPEC.md` | TC-XXXX test design |
| `VALIDATION_SUMMARY.md` | VER results + EvalGate block |
| `EVAL_RESULTS.md` | Eval flywheel; Gate 2 prerequisite |
| `ATM.md` | REQ → ART → VER traceability |
| `DECISION_LOG.md` | Append-only decisions (Principle #9) |
| `CHANGE_LOG.md` | CR-XXXX change requests |
| `RISK_REGISTER.md` | RISK-XXXX register |
| `CAPA_LOG.md` | Corrective/preventive actions |
| `APPROVALS.md` | Human Gate records |
| `CHECKPOINTS.md` | Durable HITL interrupts |
| `TRACE_LOG.md` | Policy/tool spans |
| `REVALIDATION_LOG.md` | Model/platform revalidation |
| `POLICY.yaml` | Policy-as-code (version 1.0.0) |
| `config.json` | Authority matrix, providers, verification cmds |
| `phases/` | Per-phase PLAN, SUMMARY, CONTEXT |
| `cycles/` | Frozen archives after Gate 2 (C1, C2, …) |

## Pipeline

```
Stage 1: Requirements → Stage 2: Validation → [Gate 1]
→ Stage 3: Synthesis → Stage 4: Verification → [Gate 2] → Acceptance
```

## Project Verification (default)

```bash
npm test && npx tsc --noEmit && npm run lint
```

Initialized: **2026-05-30** | Cycle: **C1 (closed)** | Archive: **`cycles/C1/`** | Policy: **1.0.0**

## C1 Status

Gate 2 closed **2026-05-30** — see `cycles/C1/GATE2_SIGNOFF.md`. Living `STATE.md` points to C2 bootstrap when next cycle starts.
