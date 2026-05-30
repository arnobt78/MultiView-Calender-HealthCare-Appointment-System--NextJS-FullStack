# Requirements — HealthCal Pro

<!-- Revision: C1 | Status: active | Last updated: 2026-05-30 -->

## Document Control

| Field | Value |
|-------|-------|
| Cycle | C1 |
| Author | Requirement Architect |
| Gate 1 status | approved |
| Canonical source | this file |

## Requirements

### REQ-0001 — CP category-management parity + active/inactive booking selects

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P1 |
| Risk | R1 |
| Owner | Human |

**Statement:** As an admin, I need category management to match patient-management UX (SSR prefetch, stats, filters, table, violet glass CRUD dialog, detail footer) and booking dropdowns to filter inactive entities so scheduling stays accurate.

**Acceptance criteria:**
1. `/control-panel/category-management` SSR-prefetches categories; sidebar persists; only table/stat values pulse on load.
2. List supports create/edit/delete via glass dialog and row ⋮ menu; detail page has Update/Delete footer (no broken `?mode=edit`).
3. Booking `<Select>` for patients/categories: active selectable; inactive shown disabled at bottom with separator; edit preserves current inactive selection.
4. Lists/tables/calendar filters still show all categories/patients including inactive.
5. CRUD invalidates cache everywhere without page refresh (`invalidateEntityAffectingAppointments("categories")`).

**Constraints:**
- `queryKeys` from `query-keys.ts`; no hardcoded keys.
- `export const dynamic = "force-dynamic"` on affected routes.
- Violet glass dialog; amber stats/table frame (not sky/emerald).
- Work on `main` only; do not delete existing files.

**Out of scope:**
- Calendar `Filters.tsx` active filtering.
- Patient booking wizard category select.
- New branches or summary `.md` docs.

## Traceability Index

| REQ-ID | Status | Linked CR | ART-IDs | VER-IDs |
|--------|--------|-----------|---------|---------|
| REQ-0001 | approved [C1] | — | ART-0001..0015 | VER-0001..0004 |
| REQ-0002 | approved [C1] | REQ-0001 | ART-0016..0019 | VER-0005..0006 |
| REQ-0003 | approved [C1] | REQ-0002 | ART-0020..0022 | VER-0007..0008 |

### REQ-0003 — Invalidation hardening + portal category live panel

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P2 |
| Risk | R1 |
| Owner | Human |
| Parent | REQ-0002 |

**Statement:** Tighten appointment→entity snapshot invalidation (old/new FK, bulk imports), live portal category detail, stats isFetching pulse, cross-tab patients/categories scopes.

**Acceptance criteria:**
1. Category/patient detail snapshots invalidate on old + new FK when appointment category/patient changes.
2. Booking, ICS, Google import bust category caches appropriately.
3. Portal `/categories/:id` uses SSR snapshot seed + live refetch.
4. Stats value slots pulse on background refetch (`isFetching`).

**Out of scope:** Calendar Filters.tsx; patient booking API category_id assignment.

### REQ-0002 — Category gap hardening (snapshot, cache patch, assignees)

| Field | Value |
|-------|-------|
| Status | approved [C1] |
| Priority | P2 |
| Risk | R1 |
| Owner | Human |
| Parent | REQ-0001 |

**Statement:** Close post-refactor gaps: assignee picker active/inactive, live category detail appointments via snapshot, optimistic category cache patches, metrics isFetching, table header parity.

**Acceptance criteria:**
1. Assignees picker uses active/inactive partition (same as core scheduling selects).
2. CP category detail appointments refetch after appointment CRUD without navigation.
3. Category create/update patches TanStack cache instantly; delete removes detail/snapshot queries.
4. Category list metrics reflect `isFetching`; table headers use clinical column pattern.

**Out of scope:** Calendar Filters.tsx; portal category live panel; UI component tests.
