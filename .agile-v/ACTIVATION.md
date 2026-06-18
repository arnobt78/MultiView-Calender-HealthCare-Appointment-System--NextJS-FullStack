# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Sync: 2026-06-18 EOD | Infinity Loop ACTIVE -->

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

1. `STATE.md` — **C61.1 shipped** · **1356/1356** · HEAD **`a37727b`** · **manual QA pending**
2. `CHECKPOINTS.md` — halt if any **PENDING** HITL (**none**)
3. `REQUIREMENTS.md` — parent **REQ-XXXX** before any code (**REQ-0112 shipped**; need **REQ-0113** for C62)

## 3. Before coding (mandatory gate)

1. Read `STATE.md` + `CHECKPOINTS.md`.
2. Resolve parent `REQ-XXXX` — **halt if missing**.
3. Pipeline: **Specify → Constrain → [Gate1] → Orchestrate → Prove → Verify → [Gate2] → Accept**
4. CRUD: `queryKeys` + invalidation helpers — never hardcode keys.
5. Verify: `npm test && npx tsc --noEmit && npm run lint && npm run build`
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
| C57–C59 | 0108–0110 | shipped | `40ed2cd` |
| C60 | 0111 | shipped | `a37727b` |
| C61 | 0112 | shipped | `a37727b` |
| C61.1 | 0112 | shipped | `a37727b` |

**Baseline:** **1356** tests · **281** files · committed **`a37727b`** · 2026-06-18

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

## 10. Today’s workflow (2026-06-18) — closed

- Shipped C60–C61.1 in one commit; pushed `main`.
- Patient portal: **no** self-cancel/edit (confirmed product decision).
- **You:** manual QA billing gates + cancel/refund flows.
- **Next agent:** C62 specify only after QA or explicit new feature ask.
