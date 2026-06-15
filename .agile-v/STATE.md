# Agile V — Living State

<!-- Updated: 2026-06-15 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C37.3** closed · **C38** — Specify (idle) |
| **Phase** | — (awaiting new REQ) |
| **Stage** | 0 — Specify next |
| **Status** | **ready** |
| **Last Updated** | 2026-06-15 |
| **Parent REQ** | — (add REQ-0088+ in REQUIREMENTS.md before code) |

## Verify baseline (session activation)

**1154/1154** · tsc · lint · build — PASS · HEAD `ea40860`

## Last shipped (C37 chain — engineering hardening, no REQ)

| Sub | Theme |
|-----|-------|
| C37 | Auth login transition — hard replace, pending-guard, `loadingGoogle`, deferred toasts |
| C37.1 | GCal provider stable tree — no Login/Landing remount on auth seed |
| C37.2 | GCal sync error policy — events fail ≠ disconnected |
| C37.3 | GCal Sync Behavior header layout; subsection icon stretch; ICS import label null guard |

## Last REQ-backed (C36.2.1)

**REQ-0087** — Staff appointment detail gcal SSR seed.

## HITL

| Gate | Status |
|------|--------|
| CHECKPOINTS | none PENDING |
| GATE-0005..0014 + C8–C36 | backlog pending archive |

## Next (Infinity Loop entry)

1. **Specify C38** — requirement-architect → `REQ-0088` in `REQUIREMENTS.md`
2. **Constrain** — logic-gatekeeper → Gate 1 if needed
3. **Orchestrate** — `build-agent-js` + `test-designer` (halt without parent REQ)
4. **Verify** — `npm test && npx tsc --noEmit && npm run lint && npm run build`

## Engineering hooks (every prompt)

`queryKeys` + invalidation · `getSessionUser()` · `dynamic = "force-dynamic"` APIs · `rbac.ts` · `Link` internal · `CLAUDE.md` · `docs/PROJECT_WALKTHROUGH.md` · `.claude/SESSION.md`
