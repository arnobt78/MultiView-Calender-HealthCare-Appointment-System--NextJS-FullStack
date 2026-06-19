# Agile V — Session Activation (every prompt)

<!-- HealthCal Pro | v1.4 | Sync: 2026-06-19 EOD | Infinity Loop ACTIVE -->

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

1. `STATE.md` — **C68 shipped** · **1413/1413** · HEAD **`7b800c6`**
2. `CHECKPOINTS.md` — halt if any **PENDING** HITL (**none**)
3. `REQUIREMENTS.md` — parent **REQ-XXXX** before code (**REQ-0117 shipped**; need **REQ-0118** for C69)

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
| C62–C67 | 0113–0116 + UX | shipped | `226271e` |
| C68 | 0117 | shipped | `a78db70` |
| C61.1 | 0112 | shipped | `a37727b` |

**Baseline:** **1413** tests · **295** files · HEAD **`7b800c6`** · pushed `origin/main` · 2026-06-19

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

## 10. Session activation (2026-06-19 EOD) — **CURRENT**

- agile-v-core + pipeline + lifecycle + compliance loaded; **24 skills** active.
- Verify **1413/1413** · tsc · lint · build PASS · pushed `main`.
- HEAD **`7b800c6`**; C68 feature **`a78db70`**.
- CHECKPOINTS clear · no PENDING HITL.
- **Idle** — manual QA optional; **halt until REQ-0118** for C69 feature work.
- Key C68 paths: `admin-portal-load.ts` · `components/admin-portal/*` · `invalidateAdminPortal`.

## 11. Prior session (2026-06-19 AM) — closed

- Shipped C62–C65 billing tranche; C60–C61.1 prior on `a37727b`.
- EOD: C67 month view + C68 admin portal; audit + push.
