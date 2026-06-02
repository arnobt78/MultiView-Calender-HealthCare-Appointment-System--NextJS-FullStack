# CLAUDE.md

Compact agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-02)

- **Invoice revenue KPI grid:** `InvoiceRevenueKpiGrid` — 12 cards on insights (paid in period, vs prior % green/red, status breakdown, total/avg/payment success). CP invoice-management + org billing include month comparison cards. Paid collected uses `paid_at` with `created_at` fallback (`insights-paid-collected.ts`). Charts: paid revenue labels/tooltips use `formatBillingKpiMoney` (not raw cents).
- **Insights KPI period hint:** `formatInsightsPeriodStatValueLabel` on appointment + revenue stat value rows. **Telehealth %** uses `fetchTelehealthShareForPeriod` (View-as `start` window; top-row Today/week/month/YTD stay calendar-fixed).
- **Staff calendar scope:** owner **OR** treating **OR** accepted assignee — list, `?ids=`, export, sync, search, SSR+email.
- **Doctor portal / confirms / org billing:** stacked headers; `ConfirmActionDialog`; full org panels + billing-totals query keys.
- **Verify:** `npm test` **638** / **114** files, tsc, lint, build.

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

- Billing KPI: `invoice-billing-totals.ts`, `InvoiceRevenueKpiGrid.tsx`, `invoice-revenue-kpi-presets.ts`
- Insights: `insights-kpi-format.ts`, `AnalyticsRevenueStatsRow.tsx`, `insights-aggregate.ts`
- Scope: `staff-appointment-calendar-scope.ts`
- Query/SSR: `query-keys.ts`, `server-prefetch.ts`, `org-billing-prefetch.ts`

## Principle

Minimal typed diffs; shared abstractions; preserve cache/SSR/invalidation unless task requires change.
