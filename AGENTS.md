# Agent Instructions — HealthCal Pro

**Agile V v1.4** — Infinity Loop on **every** prompt, fix, and feature.

## Mandatory load order

1. **`agile-v-core`** — values, SCOPE-V, traceability, halt conditions
2. **`agile-v-pipeline`** — 5-stage workflow, handoffs, checkpoints
3. **`agile-v-lifecycle`** — C2+ archive / change requests
4. **Role skill** — `.agile-v/SKILLS.md` (24 agents)
5. **`agile-v-compliance`** — Human Gates, risk/CAPA, Gate 2 close

**Session card:** `.agile-v/ACTIVATION.md` (read every prompt) · **Core:** `.agile-v/agile-v-core.md` · **Cursor rule:** `.cursor/rules/agile-v-infinity-loop.mdc` (always on)

## Resume protocol

1. Read `.agile-v/STATE.md` (cycle, phase, status)
2. Read `.agile-v/CHECKPOINTS.md` if any `PENDING` HITL row
3. Load only artifacts for the **current stage** (paths, not full dumps)
4. Never create work without parent **`REQ-XXXX`** in `.agile-v/REQUIREMENTS.md`

## Living artifacts

| File | Purpose |
|------|---------|
| `STATE.md` | Current cycle / stage — read first |
| `REQUIREMENTS.md` | Canonical REQ-XXXX (0001..0031) |
| `BUILD_MANIFEST.md` | ART-XXXX → code paths |
| `TEST_SPEC.md` | TC-XXXX |
| `VALIDATION_SUMMARY.md` | VER-XXXX + EvalGate |
| `DECISION_LOG.md` | Append-only |
| `BOOTSTRAP.md` | C1..C6 index |
| `SKILLS.md` | 24 companion skills |

## Engineering

`CLAUDE.md` + `docs/PROJECT_WALKTHROUGH.md` — `queryKeys`, invalidation, `getSessionUser()`, RBAC, SSR + TanStack cache.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Evidence summary (gates)

```
Scope: [produced/validated] | Traceability: [REQ-IDs] | Findings: PASS/FAIL/FLAG
Decision Points: [choices] | Log → DECISION_LOG.md
```

| Cycle | Status | REQ-IDs | Human gates |
|-------|--------|---------|-------------|
| C3 | verify PASS | REQ-0009..0015 | GATE-0005, 0006 pending |
| C4 | shipped | REQ-0016..0020 | GATE-0007, 0008 pending |
| C5 | verify PASS | REQ-0021..0026 | GATE-0009, 0010 pending |
| **C6** | **active** verify PASS | REQ-0027..0031 | GATE-0011, 0012 pending |

**Next:** approve gates → archive cycles → specify **C7** before new code.
