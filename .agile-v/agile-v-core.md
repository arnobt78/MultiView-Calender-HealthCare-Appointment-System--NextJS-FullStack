# agile-v-core — Project Binding (HealthCal Pro)

<!-- Mirror of `~/.cursor/skills/agile-v-core/SKILL.md` v1.4 — load skill file each session; this file = repo-local quick ref -->

## Load order (every prompt)

1. `agile-v-core` → 2. `agile-v-pipeline` → 3. `agile-v-lifecycle` (C2+) → 4. role skill (`SKILLS.md`) → 5. `agile-v-compliance` (gates)

## Values (4)

Verified iteration · Traceable agency · Automated compliance · Human curation (gates)

## Directives (halt if violated)

| # | Rule |
|---|------|
| 1 | V-position: Left=REQs, Apex=synth, Right=verify |
| 2 | No artifact without parent `REQ-XXXX` in `REQUIREMENTS.md` |
| 3 | Build agent does not self-verify |
| 4 | Gate 2 needs `EVAL_RESULTS.md` PASS/WAIVED |
| 5 | HITL → `CHECKPOINTS.md` + `APPROVALS.md` before resume |
| 6 | Honor `POLICY.yaml`; log spans to `TRACE_LOG.md` |

## SCOPE-V ↔ Pipeline

| SCOPE-V | Stage | Agents |
|---------|-------|--------|
| Specify | 1 | requirement-architect, discovery-analyst, threat-modeler, ux-spec-author |
| Constrain | 2 | logic-gatekeeper |
| Orchestrate | 3 | build-agent-js, test-designer |
| Prove | 3–4 | build-agent, compliance-auditor |
| Evolve | all | DECISION_LOG, CHANGE_LOG |
| Verify | 4 | red-team-verifier |

## Context rules

Read `STATE.md` first · pass paths not dumps · fresh sub-agent context · tasks ≤50% context window

## Living artifacts

`STATE.md` `REQUIREMENTS.md` `BUILD_MANIFEST.md` `TEST_SPEC.md` `VALIDATION_SUMMARY.md` `DECISION_LOG.md` `EVAL_RESULTS.md` `BOOTSTRAP.md` `SKILLS.md`

## Project engineering (non-negotiable)

`queryKeys` + invalidation helpers · `getSessionUser()` · `dynamic = "force-dynamic"` APIs · `rbac.ts` · SSR seed + TanStack `setQueryData` on CRUD · `Link` not `<a href>`

## Resume (tomorrow)

Cycle **C5** · Stage **4 Verify** (automated PASS 742) · Human **GATE-0009/0010** pending · Backlog: archive C3/C4 gates · optional portal `/admins/[id]` audit
