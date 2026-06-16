# Cycle C39 — Telehealth queue (Control Panel)

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0089 (C39.1) · REQ-0090 (C39.2) |
| **Commit** | `3fd00b1` |
| **Gate 1/2** | TBD |
| **Tests** | **1203**/1203 at ship |

## Scope

| Sub | Theme |
|-----|-------|
| C39.1 | Violet glass queue, KPIs, filter tabs, glass Join, `is_telehealth` filter |
| C39.2 | Doctor identity, clock+status header, category block, full datetime list rows |

## Key paths

`control-panel/telehealth/*` · `telehealth-queue-filter.ts` · `telehealth-queue-display.ts` · `telehealth-queue-ui-classes.ts`
