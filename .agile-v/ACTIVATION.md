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

1. `STATE.md` — **C48.1 shipped** · **1270/1270** · HEAD **`8ba3acf`**
2. `CHECKPOINTS.md` — halt if any **PENDING** HITL (**none**)
3. `REQUIREMENTS.md` — parent **REQ-XXXX** before any code (**REQ-0001..0099 shipped**)

## 3. Before coding (mandatory gate)

1. Read `STATE.md` + `CHECKPOINTS.md`.
2. Resolve parent `REQ-XXXX` — **halt if missing** (need **REQ-0100+** for C49).
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
| C43 / C43.1 | 0094 | shipped | — |
| C44 | 0095 | shipped | — |
| C45 | 0096 | shipped | — |
| C46 | 0097 | shipped | `45c87e5` |
| C47 | 0098 | shipped | `1e252b0` |
| C48 / C48.1 | 0099 | shipped | `8ba3acf` |

**Baseline:** **1270** tests · **259** files · committed **`8ba3acf`** · 2026-06-17

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
