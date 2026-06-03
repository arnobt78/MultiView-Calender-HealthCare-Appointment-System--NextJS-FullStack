# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-02)

- **Invoice dialog:** amber glass `InvoiceFormDialog` (create+edit); rich visit picker; `StaffInvoiceDialogShell` on CP/dashboard/doctor/appointments/invoices layouts; preset create from appointment ⋮ + detail **New Invoice**; `useInvoiceFormDialogController` + `InvoiceFormDialogProvider`.
- **Invoice detail live:** `InvoiceDetailLiveBody` + `useInvoice`; **Edit details** on detail header; `GET /api/invoices/[id]` + prefetch + `/api/payments` attach `visit_summary`.
- **Doctor edit RBAC:** own draft/sent/overdue → `mutate` (description/due_date PATCH).
- **SSE:** `notification-stream-sse.ts` safe enqueue; route abort + error stop (no heartbeat spam).
- **Invalidation:** invoice CRUD → `invalidateAfterInvoiceWrite` busts `invoices.*` + `billing.root` (picker); unchanged.
- **Verify:** `npm test` **666** / **120** files, tsc, lint, build. Day/Week/Month/List hover cards show invoice badge via `useAppointmentInvoiceDisplayMap`.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + `query-client` helpers; `getSessionUser()` APIs; `dynamic = "force-dynamic"` new APIs; RBAC `rbac.ts`; `Link` internal; native checkbox.

## Verify

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient/category | `invalidateEntityAffectingAppointments` |
| Invoice/payment | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` |
| Schedule | `invalidateDoctorSchedule` |
| Users | `invalidateUsersAndAuth` |

Cross-tab: `query-cache-cross-tab.ts` in `QueryProvider`.

## Key paths

- Invoice dialog: `invoice-dialog/`, `InvoiceFormDialogContext.tsx`, `useInvoiceFormDialogController.tsx`, `invoice-form-guards.ts`, `useBillingAppointmentOptionById.ts`
- Billing KPI: `invoice-billing-totals.ts`, `InvoiceRevenueKpiGrid.tsx`
- SSE: `notification-stream-sse.ts`, `notifications/stream/route.ts`
- Query/SSR: `query-keys.ts`, `server-prefetch.ts`, `org-billing-prefetch.ts`
- Scope: `staff-appointment-calendar-scope.ts`

## Principle

Minimal typed diffs; shared abstractions; preserve cache/SSR/invalidation unless task requires change.
