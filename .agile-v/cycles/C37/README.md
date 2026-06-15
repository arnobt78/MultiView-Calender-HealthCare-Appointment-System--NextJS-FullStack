# Cycle C37 — Auth login transition + GCal sync UX

<!-- Living cycle — engineering hardening (no REQ); archive optional -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | — (no formal REQ; trace in DECISION_LOG) |
| **Sub-cycles** | C37 auth nav · C37.1 remount fix · C37.2 gcal sync flip |
| **Bootstrap** | 2026-06-14 |
| **Commits** | `bb17816` · `ea40860` |
| **Gate 1/2** | N/A (hardening) |
| **Tests** | **1154**/1154 |

## Scope

| Sub | Fix |
|-----|-----|
| C37 | `beginAuthNavigation` hard replace + pending-guard; `loadingGoogle`; `auth-pending-toast.ts`; bare-path query gate |
| C37.1 | `GoogleCalendarSyncProviderInner` always mounted; `enabled={isStaff}`; Login disabled fields; Landing motion freeze |
| C37.2 | `GET /api/calendar/sync` nested catch; `useGoogleCalendar` 404/401 vs throw |

## Key libs

`auth-pending-toast.ts` · `useAuthNavButtonLoading.ts` · `nav-session-ssr-seed.ts` · `GoogleCalendarSyncContext.tsx` · `Login.tsx` · `LandingPage.tsx`

## Invariants

Inline button spinner only · no full-screen overlay · welcome toast on destination only · `seedAuthMeFromLoginResponse` before nav
