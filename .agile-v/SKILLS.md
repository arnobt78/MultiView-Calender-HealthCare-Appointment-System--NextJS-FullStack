# Agile V Agent Skills Registry — HealthCal Pro

<!-- 24 companion skills | Pipeline + SCOPE-V phase mapping | v1.4 -->

## Orchestration & Lifecycle (4)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 1 | `agile-v-core` | Apex | All | All — load first |
| 2 | `agile-v-pipeline` | Apex | Orchestrate | Waves, handoffs, checkpoints |
| 3 | `agile-v-lifecycle` | Apex | Evolve | Cycles, CR, archival |
| 4 | `agile-v-compliance` | Right | Verify, Evolve | Risk, CAPA, gates, revalidation |

## Quality & Product (2)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 5 | `agile-v-quality-gates` | Right | Constrain, Verify | Gate criteria, interface validation |
| 6 | `agile-v-product-owner` | Left | Specify | Backlog, REQ prioritization, INVEST |

## Left — Decomposition (4)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 7 | `requirement-architect` | Left | Specify | 1 — Requirements |
| 8 | `discovery-analyst` | Left | Specify | 1 — Discovery → hypotheses |
| 9 | `threat-modeler` | Left | Specify, Constrain | 1–2 — STRIDE / privacy REQs |
| 10 | `ux-spec-author` | Left | Specify | 1 — Design constraints → REQs |

## Apex — Constrain & Orchestrate (8)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 11 | `logic-gatekeeper` | Apex | Constrain | 2 — Validation |
| 12 | `build-agent` | Apex | Orchestrate, Prove | 3 — Synthesis (generic) |
| 13 | `build-agent-js` | Apex | Orchestrate, Prove | 3 — Next.js / React / TS |
| 14 | `build-agent-nestjs` | Apex | Orchestrate, Prove | 3 — NestJS APIs (if used) |
| 15 | `build-agent-python` | Apex | Orchestrate, Prove | 3 — Python scripts / ETL |
| 16 | `build-agent-dart` | Apex | Orchestrate, Prove | 3 — Flutter (if used) |
| 17 | `build-agent-embedded` | Apex | Orchestrate, Prove | 3 — Firmware (if used) |
| 18 | `schematic-generator` | Apex | Orchestrate | 3 — Hardware (N/A this repo) |

## Right — Prove & Verify (4)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 19 | `test-designer` | Right | Orchestrate, Prove | 3 — TEST_SPEC.md (parallel w/ build) |
| 20 | `red-team-verifier` | Right | Verify | 4 — Independent verification |
| 21 | `compliance-auditor` | Right | Verify, Evolve | All stages — DECISION_LOG, ATM |
| 22 | `documentation-agent` | Right | Prove | 5 — docs/ suite (on request) |

## Release & Observability (2)

| # | Skill | V-Position | SCOPE-V Phases | Pipeline Stage |
|---|-------|------------|----------------|----------------|
| 23 | `observability-planner` | Right | Specify, Prove | Metrics, SLOs (post-Gate 2) |
| 24 | `release-manager` | Right | Verify | 5 — Rollout, rollback, sign-off |

## Default Stack for This Repo

| Layer | Primary skill |
|-------|----------------|
| Next.js App Router + React 19 | `build-agent-js` |
| Prisma / Postgres API routes | `build-agent-js` |
| Vitest | `test-designer` + `red-team-verifier` |
| Vercel deploy | `release-manager` |

## Load Order (Infinity Loop)

```
1. agile-v-core
2. agile-v-pipeline (+ lifecycle on C2+)
3. Role skill for current stage (table above)
4. agile-v-compliance on gate pause / close
```

## Project Paths

| Artifact | Path |
|----------|------|
| Living state | `.agile-v/STATE.md` |
| Requirements | `.agile-v/REQUIREMENTS.md` |
| This registry | `.agile-v/SKILLS.md` |
| Frozen cycles | `.agile-v/cycles/CN/` |
| Engineering guide | `CLAUDE.md` (gitignored locally) |
| Walkthrough | `docs/PROJECT_WALKTHROUGH.md` |
