# Agile V — Living State

<!-- Updated: 2026-06-14 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C36.2.1** — Appointment detail gcal SSR seed |
| **Phase** | Accept |
| **Stage** | 5 |
| **Status** | shipped |
| **Last Updated** | 2026-06-14 |
| **Parent REQ** | REQ-0087 |

## Verify baseline (C36.2.1 close)

**1140/1140** · tsc · lint · build — PASS

## C36.2.1 shipped (REQ-0087)

- Staff appointment detail pages prefetch + seed `googleCalendar` status for sync footer first paint.

## C36.2 shipped (REQ-0086)

- Cancel/DELETE unlink Google events; PUT/PATCH shared side-effects; `GoogleCalendarSyncProvider`; dashboard SSR gcal seed; `maybeInvalidateGoogleCalendarIfConnected`; menu test.

## C36.1 shipped (REQ-0085)

- `google_calendar_event_id` on Appointment; auto-sync CRUD; manual sync UI; import resolver; OAuth param helpers.

## C36 shipped (REQ-0084)

- OAuth redirect → CP google-calendar tab; glass UI panels; events DataTable; advanced ICS import.
