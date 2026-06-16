# Cycle C41 — Telehealth badge parity + invoice SSR

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0092 |
| **Commits** | `091bb70` (C41) · `e8544ee` (C41.1) |
| **Verify** | 1220/1220 · tsc · lint · build PASS |

## Delivered

- `AppointmentVisitMetaBadgeRow` + `appointment-visit-meta-resolve.ts`
- Invoice SSR on telehealth queue prefetch
- `resolvePortalAppointmentDetailLinkPolicy` — doctor portal patient links
- Billing skeleton when `invoices.all` cold
- Sentry client tunnel (`instrumentation-client.ts`)

## Resume

Next cycle: **C42** (REQ-0093) — shipped `2b53b92`
