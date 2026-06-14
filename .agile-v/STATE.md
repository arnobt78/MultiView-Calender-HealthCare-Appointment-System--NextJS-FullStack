# Agile V — Living State

<!-- Updated: 2026-06-14 | Project: HealthCal Pro | Resume: ACTIVATION.md -->

## Current Status

| Field | Value |
|-------|-------|
| **Cycle** | **C37.2** — Auth nav + gcal sync UX |
| **Phase** | Accept |
| **Stage** | 5 |
| **Status** | shipped |
| **Last Updated** | 2026-06-14 |
| **Parent REQ** | — (engineering hardening; no new REQ) |

## Verify baseline (C37.2 close)

**1154/1154** · tsc · lint · build — PASS · HEAD `bb17816`

## C37.2 shipped (gcal connect flip)

- `GET /api/calendar/sync`: token exists + events fail → 200 `{connected:true,events:[]}` not 500.
- `useGoogleCalendar` queryFn: 404/401 → disconnected; other errors throw (retry, keep cache).

## C37.1 shipped (auth remount root cause)

- `GoogleCalendarSyncProviderInner` always mounted; `useGoogleCalendar({ enabled: isStaff })` — stable tree when `seedAuthMeFromLoginResponse` runs.
- Login fields `disabled={loading}`; Landing `AppointmentDeck` freezes motion when `authTransitionActive`.

## C37 shipped (auth login transition)

- `beginAuthNavigation`: pending-guard (same from+dest skip) + `window.location.replace(dest)`.
- `loadingGoogle` separate from email/pw `loading` on Login.
- `seedAuthMeFromLoginResponse` + `shouldRunAuthenticatedAppQueries` gate dashboard prefetch on bare paths.
- Deferred welcome toast via `auth-pending-toast.ts`; debug logs removed.

## Prior (C36.2.1 REQ-0087)

- Staff appointment detail SSR + seed gcal status for sync footer first paint.

## Next

Human Gate backlog → archive C3–C36 → **Specify C38** (new REQ in REQUIREMENTS.md) before feature code.
