# Cycle C8 / C8.1 / C9 — Page chrome + portal chrome

<!-- Living cycle — archive on Human Gate 2 (TBD) -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0038..REQ-0045 |
| **ART-IDs** | ART-0202..ART-0223 |
| **Bootstrap** | 2026-06-09 |
| **Commits** | C8 `52ba8f8+` · C8.1/C9 `bc97070` |
| **Gate 1** | TBD |
| **Gate 2** | TBD |
| **Tests** | **863**/863 Vitest (166 files) |

## Scope

| REQ | Theme |
|-----|-------|
| REQ-0038 | `AppPageChrome` + 14 CP section headers |
| REQ-0039 | SSR chrome shell + warm-cache `listBodyLoading` |
| REQ-0040 | Admin portal redesign — `PatientStatCard` KPIs |
| REQ-0041 | Merged CP sticky header + `ControlPanelChromeActions` registry |
| REQ-0042 | `PortalPageChrome` + `portal-page-chrome-config` |
| REQ-0043 | Entity detail chrome → `AppPageChrome` slots |
| REQ-0044 | Dashboard toolbar-only `CalendarHeader` |
| REQ-0045 | CP chrome no `border-b`; prefetch/invalidation unchanged |

## Notes

- Invalidation helpers unchanged across chrome work.
- Manual smoke: all 14 CP tabs + portal routes + dashboard toolbar.
