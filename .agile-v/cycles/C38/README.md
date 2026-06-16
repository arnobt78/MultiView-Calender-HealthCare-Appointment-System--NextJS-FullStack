# Cycle C38 — Google Calendar API warning + connect backfill

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0088 |
| **Bootstrap** | 2026-06-15 |
| **Gate 1/2** | TBD |
| **Tests** | regression PASS |

## Scope

GCal API warning banner when provider errors; connect backfill for disconnected-but-token-present state.

## Key paths

`GoogleCalendarPanel` · `useGoogleCalendar` · connect backfill helpers
