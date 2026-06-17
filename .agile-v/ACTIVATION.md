# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Sync: 2026-06-17 Infinity Loop ACTIVE -->

## 1. Load skills (mandatory — every prompt)

| # | Skill | When |
|---|-------|------|
| 1 | `agile-v-core` | **Always first** |
| 2 | `agile-v-pipeline` | **Always** |
| 3 | `agile-v-lifecycle` | C2+ / archive / CR |
| 4 | Role from `SKILLS.md` | By pipeline stage |
| 5 | `agile-v-compliance` | Gates, risk, CAPA, Gate 2 close |
| 6 | `agile-v-quality-gates` | Constrain + Verify (optional tighten) |

**24 agents:** `.agile-v/SKILLS.md` · **Repo stack:** `build-agent-js`

## 2. Read (resume — in order)

1. `STATE.md` — **C42.2 shipped** · **1220/1220** · HEAD **`eb3d576`**
2. `CHECKPOINTS.md` — halt if any **PENDING** HITL (**none**)
3. `REQUIREMENTS.md` — parent **REQ-XXXX** before any code (**REQ-0001..0093**)

## 3. Before coding (mandatory gate)

1. Read `STATE.md` + `CHECKPOINTS.md`.
2. Resolve parent `REQ-XXXX` — **halt if missing**.
3. Pipeline: **Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept**
4. CRUD: `queryKeys` + invalidation helpers — never hardcode keys.
5. Verify: Red Team suite — `npm test && npx tsc --noEmit && npm run lint && npm run build`
6. Gate 2: `EVAL_RESULTS.md` `eval_gate_status: PASS` required.

## 4. Infinity Loop

```
Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept
         ↑___________________________________________________________|
```

## 5. Traceability

`REQ-XXXX` → `ART-XXXX` → `TC-XXXX` → `VER-XXXX` → append `DECISION_LOG.md`

## 6. Cycle index (living)

| Cycle | REQ | Status | HEAD |
|-------|-----|--------|------|
| C38 | 0088 | shipped | — |
| C39 / C39.1 / C39.2 | 0089–0090 | shipped | `3fd00b1` |
| C40 | 0091 | shipped | `091bb70` |
| C41 / C41.1 | 0092 | shipped | `e8544ee` |
| **C42 / C42.2** | **0093** | **shipped** | **`2b53b92`** |

**Baseline:** **1220** tests · **245** files · committed **`eb3d576`** · 2026-06-17

## 7. Halt if

No parent REQ · ambiguous REQ · self-verify only · skip invalidation · Gate 2 without EVAL PASS · PENDING checkpoint

## 8. Project hooks

`AGENTS.md` · `CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `.cursor/rules/agile-v-infinity-loop.mdc` (always on)

## 9. Default role map (this repo)

| Stage | Skill |
|-------|-------|
| Specify | `requirement-architect` (+ `ux-spec-author` if UI) |
| Constrain | `logic-gatekeeper` |
| Orchestrate | `build-agent-js` ∥ `test-designer` |
| Verify | `red-team-verifier` |
| Accept / gates | `agile-v-compliance` + `compliance-auditor` |
