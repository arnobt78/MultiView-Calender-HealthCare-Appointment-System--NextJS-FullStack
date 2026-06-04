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

## Skill file locations (Cursor)

Skills load from user skills directory (Read tool). Primary paths:

| Skill | Path |
|-------|------|
| agile-v-core | `~/.cursor/skills/agile-v-core/SKILL.md` |
| agile-v-pipeline | `~/.cursor/skills/agile-v-pipeline/SKILL.md` |
| agile-v-lifecycle | `~/.cursor/skills/agile-v-lifecycle/SKILL.md` |
| agile-v-compliance | `~/.cursor/skills/agile-v-compliance/SKILL.md` |
| agile-v-quality-gates | `~/.cursor/skills/agile-v-quality-gates/SKILL.md` |
| agile-v-product-owner | `~/.cursor/skills/agile-v-product-owner/SKILL.md` |
| requirement-architect … release-manager | `~/.cursor/skills/<name>/SKILL.md` |

## Project Paths

| Artifact | Path |
|----------|------|
| Agent instructions | `AGENTS.md` |
| Cursor rule (always on) | `.cursor/rules/agile-v-infinity-loop.mdc` |
| Living state | `.agile-v/STATE.md` |
| Project core binding | `.agile-v/agile-v-core.md` |
| Requirements | `.agile-v/REQUIREMENTS.md` |
| This registry | `.agile-v/SKILLS.md` |
| Frozen cycles | `.agile-v/cycles/CN/` |
| Engineering guide | `CLAUDE.md` (gitignored locally) |
| Walkthrough | `docs/PROJECT_WALKTHROUGH.md` |
