# Build Manifest — HealthCal Pro

<!-- Cycle: C1 | Last updated: 2026-05-30 -->

## Artifacts

| ART-ID | Cycle | REQ-ID | Path / Description | Status |
|--------|-------|--------|-------------------|--------|
| ART-0001 | C1 | REQ-0001 | `src/lib/entity-active-status.ts` | built |
| ART-0002 | C1 | REQ-0001 | `src/lib/category-dialog-ui-classes.ts` | built |
| ART-0003 | C1 | REQ-0001 | `src/lib/category-form-state.ts` | built |
| ART-0004 | C1 | REQ-0001 | `src/lib/category-management-toolbar-classes.ts` | built |
| ART-0005 | C1 | REQ-0001 | `src/hooks/useCategoryListMetrics.ts` | built |
| ART-0006 | C1 | REQ-0001 | `src/context/CategoryMetricsContext.tsx` | built |
| ART-0007 | C1 | REQ-0001 | `src/components/control-panel/CategoryListFiltersContext.tsx` | built |
| ART-0008 | C1 | REQ-0001 | `src/components/control-panel/CategoryManagementStatsRow.tsx` | built |
| ART-0009 | C1 | REQ-0001 | `src/components/control-panel/category-dialog/*` | built |
| ART-0010 | C1 | REQ-0001 | `src/components/control-panel/CategoryManagement.tsx` | rebuilt |
| ART-0011 | C1 | REQ-0001 | `src/components/control-panel/CategoryDetailScreen.tsx` (CP) | built |
| ART-0012 | C1 | REQ-0001 | `src/components/shared/select/ActiveInactiveSelectSections.tsx` | built |
| ART-0013 | C1 | REQ-0001 | SSR: `[section]/page.tsx`, `ControlPanelPage.tsx`, `categories/[id]/page.tsx` | built |
| ART-0014 | C1 | REQ-0001 | Appointment booking selects (GeneralSection + DetailForm) | built |
| ART-0015 | C1 | REQ-0001 | `src/lib/__tests__/entity-active-status.test.ts` | built |
| ART-0016 | C1 | REQ-0002 | `src/lib/category-snapshot-data.ts`, snapshot API, query keys, hooks | built |
| ART-0017 | C1 | REQ-0002 | `src/lib/category-query-cache.ts`, cache patch in `useCategories.ts` | built |
| ART-0018 | C1 | REQ-0002 | Assignees active/inactive picker + CP category live panel | built |
| ART-0019 | C1 | REQ-0002 | `src/lib/__tests__/category-query-client.test.ts` | built |
| ART-0020 | C1 | REQ-0003 | `src/lib/appointment-mutation-invalidation.ts` | built |
| ART-0021 | C1 | REQ-0003 | Portal live category detail + cross-tab patients/categories | built |
| ART-0022 | C1 | REQ-0003 | Bulk/booking invalidation + stats isFetching pulse | built |

## Verification Commands (project default)

```bash
npm test        # 459 passed
npx tsc --noEmit
npm run lint
```
