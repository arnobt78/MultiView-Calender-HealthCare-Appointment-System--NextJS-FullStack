# Agile V Playbook — HealthCal Pro

<!-- v1.4 | Infinity Loop | Every prompt -->

## Load order (mandatory)

1. `agile-v-core` 2. `agile-v-pipeline` 3. `agile-v-lifecycle` (C2+) 4. `SKILLS.md` role 5. `agile-v-compliance` (gates)

## Resume (read first)

| # | File | Action |
|---|------|--------|
| 1 | `STATE.md` | cycle, verify baseline, HEAD |
| 2 | `CHECKPOINTS.md` | halt if PENDING HITL |
| 3 | `REQUIREMENTS.md` | parent REQ before code |

## Pipeline

```
Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept
         ↑___________________________________________________________|
```

| Stage | Agent skills | Output |
|-------|--------------|--------|
| Specify | requirement-architect, ux-spec-author | REQ in `REQUIREMENTS.md` |
| Constrain | logic-gatekeeper | Gate 1 evidence |
| Orchestrate | build-agent-js ∥ test-designer | code + `BUILD_MANIFEST.md` |
| Prove | build manifest, TRACE | artifacts |
| Verify | red-team-verifier | `VALIDATION_SUMMARY.md`, `EVAL_RESULTS.md` |
| Accept | agile-v-compliance | ship / archive `cycles/CN/` |

## Halt if

- No parent REQ · ambiguous REQ · Build self-verifies only
- Gate 2 without `eval_gate_status: PASS`
- Skip `queryKeys` / invalidation on CRUD
- PENDING checkpoint without `APPROVALS.md` token

## Traceability

`REQ-XXXX` → `ART-XXXX` → `TC-XXXX` → `VER-XXXX` → append `DECISION_LOG.md`

## Verify (default)

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Repo engineering (always)

`getSessionUser()` · `dynamic = "force-dynamic"` APIs · `rbac.ts` · `Link` not `<a href>` · SSR seed + TanStack invalidation helpers on writes · `CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md`

## Invalidation (CRUD)

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + patient detail |
| Invoice | `invalidateInvoicesAndOverview` |
| Types/config | `invalidateAppointmentTypeDerived` |

## Next cycle entry

**C43:** requirement-architect → **REQ-0094+** in `REQUIREMENTS.md` → Gate 1 → build → verify → accept
