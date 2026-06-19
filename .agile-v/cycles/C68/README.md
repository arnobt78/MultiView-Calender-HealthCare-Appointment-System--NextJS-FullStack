# Cycle C68 — Admin portal SSR + rich lists

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0117 (parent REQ-0040) |
| **Bootstrap** | 2026-06-19 |
| **Shipped** | `a78db70` · docs `7b800c6` |
| **Verify** | 1413/1413 · tsc · lint · build PASS |

## Scope

- Shared `fetchAdminPortalData` — API route + `prefetchAdminPortal` parity
- `/admin-portal` `force-dynamic` · skeleton fallback · parallel `prefetchInvoices`
- Rich appointment rows (patient, clinicians, category, invoice badge)
- Client pagination 25/page (100 SSR cap)
- Doctor directory — full page scroll, enriched cards, `PortalPanelSection`
- `invalidateAdminPortal` unchanged

## Key paths

`admin-portal-load.ts` · `admin-portal-pagination.ts` · `components/admin-portal/*` · `AdminPortalPageSkeleton.tsx` · `admin-portal/page.tsx`

## Tests

`admin-portal-load.test.ts` · `admin-portal-pagination.test.ts` · `AdminPortalAppointmentListRow.ui.test.tsx`

## Out of scope

`/admin-portal/[id]` detail routes · admin-portal CRUD dialogs

## Next

Specify **C69** — **REQ-0118** before code.
