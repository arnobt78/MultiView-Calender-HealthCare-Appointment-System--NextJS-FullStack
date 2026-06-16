# Cycle C40 — Portal telehealth queue + booking preset

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0091 |
| **Bootstrap** | 2026-06-15 |
| **Commit** | WIP (uncommitted) |
| **Gate 1/2** | TBD |
| **Tests** | **1206**/1206 verify PASS |

## Scope

- `/telehealth-queue` doctor/patient portal route (admin → CP redirect)
- Navbar **Telehealth Queue** link
- `viewerRole` entity links; patient plain title (join-only)
- `TelehealthQueueChromeActions` — Book/New Video Visit with telehealth type preset
- `telehealth-scheduling-types.ts` — enabled vs inactive telehealth types

## Key paths

`app/telehealth-queue/page.tsx` · `telehealth-queue-portal-prefetch.ts` · `TelehealthQueueChromeActions.tsx` · `useTelehealthSchedulingTypesForDoctor.ts`

## Known follow-up

Portal SSR seed writes appointments + doctors only (categories/patients/assignees from bundle not seeded — minor first-paint gap).
