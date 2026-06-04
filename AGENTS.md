# Agent Instructions — HealthCal Pro

This repository uses **Agile V v1.4** (Autonomous Quality Management System). Follow the Infinity Loop on **every** task, fix, and feature.

## Mandatory load order (every prompt)

1. **`agile-v-core`** — values, SCOPE-V, traceability, halt conditions
2. **`agile-v-pipeline`** — 5-stage workflow, handoffs, checkpoints
3. **`agile-v-lifecycle`** — when cycle is C2+ or archiving / change requests
4. **Role skill** — see `.agile-v/SKILLS.md` (24 agents) for current pipeline stage
5. **`agile-v-compliance`** — at Human Gates, risk/CAPA, Gate 2 close

## Resume protocol

1. Read `.agile-v/STATE.md` (cycle, phase, status)
2. Read `.agile-v/CHECKPOINTS.md` if any `PENDING` HITL row
3. Load only artifacts for the **current stage** (paths, not full dumps)
4. Never create work without a parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md`

## Living artifacts

| File | Purpose |
|------|---------|
| `STATE.md` | Current cycle / stage — read first |
| `REQUIREMENTS.md` | Canonical REQ-XXXX |
| `BUILD_MANIFEST.md` | ART-XXXX → code paths |
| `TEST_SPEC.md` | TC-XXXX (requirements-derived) |
| `VALIDATION_SUMMARY.md` | VER-XXXX + EvalGate lines |
| `DECISION_LOG.md` | Append-only decisions |
| `EVAL_RESULTS.md` | Gate 2 prerequisite |
| `BOOTSTRAP.md` | C1..CN index + checklist |
| `SKILLS.md` | 24 companion skills registry |

## Engineering constraints

Follow `CLAUDE.md` (if present locally) and `docs/PROJECT_WALKTHROUGH.md`: `queryKeys`, invalidation helpers, `getSessionUser()`, RBAC, `Link` not `<a href>`, native checkbox.

## Verification (release candidate)

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Evidence summary (gates / close)

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: [PASS/FAIL/FLAG]
Decision Points: [choices] | Log: [TIMESTAMP | AGENT | DECISION | RATIONALE | LINKED_REQ]
```

Active cycle: **C3** (verify; Gates 5–6 pending). Planned: **C4** (`REQ-0016+`). Archives: `.agile-v/cycles/C1/`, `C2/` (frozen).
