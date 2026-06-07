# Decision Log — HealthCal Pro

<!-- Append-only. Never overwrite prior entries. -->

| Timestamp | Agent | Decision | Rationale | LINKED_REQ |
|-----------|-------|----------|-----------|------------|
| 2026-05-30T00:00:00Z | init | Initialize `.agile-v/` for HealthCal Pro | Enable Agile V Infinity Loop traceability for C1 | — |
| 2026-05-30T11:34:00Z | build | Implement REQ-0001 category-management refactor | Patient-management parity, violet dialog, booking active/inactive selects | REQ-0001 |
| 2026-05-30T12:00:00Z | build | Implement REQ-0002 category gap hardening | Snapshot API, cache patches, assignees picker, table/metrics parity | REQ-0002 |
| 2026-05-30T12:30:00Z | build | Implement REQ-0003 invalidation hardening | Central resolver, portal live category, cross-tab scopes, isFetching stats | REQ-0003 |
| 2026-05-30T13:00:00Z | build | REQ-0003 polish — shared cache/snapshot libs | appointment-cache-read, entity-snapshot-invalidation, booking category FK, unified delete invalidation | REQ-0003 |
| 2026-05-30T13:04:00Z | build | REQ-0004 SSR prefetch + calendar batch assignee | dashboard/CP zero-flash seed, org cross-tab, CALENDAR limits, batch ids API | REQ-0004 |
| 2026-05-30T13:10:00Z | red-team | C1 Gate 2 automated verification PASS | 472 tests, tsc, lint, build; archive cycles/C1 | REQ-0001..0004 |
| 2026-05-30T13:10:00Z | compliance | Close C1 Gate 2 — freeze archive | Living docs updated; STATE archived status | REQ-0001..0004 |
| 2026-05-31T16:00:00Z | init | Bootstrap Agile V framework completion | SKILLS.md (24 agents), phases 02–05, BOOTSTRAP.md | — |
| 2026-05-31T16:00:00Z | build | C2 REQ-0005 doctor CP refactor | is_active, revenue, inactive UX, emerald table | REQ-0005 |
| 2026-05-31T16:00:00Z | build | C2 REQ-0006 live roster + admin detail | assigned-patients API, AdminUserDetailScreen | REQ-0006 |
| 2026-05-31T16:00:00Z | build | C2 REQ-0007 admin-only roster | CP_ADMIN_USERS_FILTERS, cross-tab doctors | REQ-0007 |
| 2026-05-31T16:00:00Z | build | C2 REQ-0008 CP dev stubs | disabled submit + API hints for create/delete/pagination | REQ-0008 |
| 2026-05-31T16:10:00Z | red-team | C2 Gate 2 automated verification PASS | 520 tests, tsc, lint, build; archive cycles/C2 | REQ-0005..0008 |
| 2026-05-31T16:10:00Z | compliance | Close C2 Gate 2 — freeze archive | STATE → C2 closed; ready C3 | REQ-0005..0008 |
| 2026-06-01T00:00:00Z | init | Bootstrap C3 retroactive traceability | Code merged post-C2; REQ-0009..0012 document billing/calendar/filters | — |
| 2026-06-01T00:00:00Z | build | REQ-0009 staff scope + curated seed | Owner OR treating physician; demo matrix for QA | REQ-0009 |
| 2026-06-01T00:00:00Z | build | REQ-0010 dashboard calendar filters | Category/patient selects + clinical role + empty state | REQ-0010 |
| 2026-06-01T00:00:00Z | build | REQ-0011 invoice billing KPI + org list | Shared totals; outstanding excludes refunded; 6/6 org invoices | REQ-0011 |
| 2026-06-01T00:00:00Z | build | REQ-0012 org SSR prefetch all orgs + empty dash | `byOrganization` keys; single em-dash placeholder | REQ-0012 |
| 2026-06-01T00:00:00Z | compliance | C1 bootstrap frozen — do not rewrite | Living docs append only; archives in `cycles/C1/` | REQ-0001..0004 |
| 2026-06-02T12:19:00Z | init | Refresh Agile V bootstrap (C1/C2/C3 index) | 589/589 tests; ART-0069/0070 billing-totals API traceability; BOOTSTRAP checklist v1.4 | REQ-0009..0012 |
| 2026-06-02T19:45:00Z | init | C3 extension bootstrap (Infinity Loop refresh) | REQ-0013 assignee scope; REQ-0014 telehealth period; REQ-0015 invoice KPI grid; 638/638 tests | REQ-0013..0015 |
| 2026-06-02T19:45:00Z | build | REQ-0013 assignee calendar scope | faee3f7 — export/sync/search/portal/login-today | REQ-0013 |
| 2026-06-02T19:45:00Z | build | REQ-0014 insights telehealth View-as | fetchTelehealthShareForPeriod; 6f13cc2 | REQ-0014 |
| 2026-06-02T19:45:00Z | build | REQ-0015 invoice revenue KPI grid | InvoiceRevenueKpiGrid, statusTotals, paid_at period; 6f13cc2 | REQ-0015 |
| 2026-06-02T19:45:00Z | red-team | C3 automated verification PASS (extended) | 638 tests, tsc, lint, build; GATE-0006 pending | REQ-0009..0015 |
| 2026-06-04T12:24:00Z | init | Infinity Loop bootstrap refresh + session activation | AGENTS.md + Cursor always-on rule; 666/666 tests; C4 scaffold REQ-0016..0020 | REQ-0009..0015 |
| 2026-06-04T12:24:00Z | requirement-architect | Draft C4 REQs for invoice dialog tranche | Product baseline 2026-06-02 in CLAUDE.md; Gate after C3 archive | REQ-0016..0020 |
| 2026-06-04T13:20:00Z | build | REQ-0016 visit fee default €150 + CP invoice DataTable parity | `DEFAULT_DOCTOR_VISIT_FEE_CENTS`; amber list/dialog picker; shared `invoice-table-cells` | REQ-0016 |
| 2026-06-04T13:20:00Z | build | REQ-0017 invoice detail glass + audit | `invoice-detail-ui-classes`; `EntityDetailRecordAuditCard`; expanded `InvoiceLinkedVisitPanel` | REQ-0017 |
| 2026-06-04T13:20:00Z | build | Doctor seed unify + appointment location prefill | `scripts/lib/doctor-profile-seed-data.ts`; `office_location` on doctor select when location empty | REQ-0016 |
| 2026-06-04T13:20:00Z | red-team | C4 UI tranche automated verification PASS | 667 tests, tsc, lint, build; ART-0086..0097 | REQ-0016, REQ-0017 |
| 2026-06-04T13:25:00Z | build | C4 polish — date picker, portal rows, seeds | `ClinicalGlassDatePicker` align end; location hint; `db:seed-demo-full`; portal `invoice-table-cells` | REQ-0016 |
| 2026-06-04T13:25:00Z | red-team | C4 polish verification PASS | 671 tests, tsc, lint, build; ART-0098..0100 | REQ-0016 |
| 2026-06-04T18:00:00Z | build | REQ-0021..0023 unified Record Audit actors | EntityDetailRecordAuditCard; appt/patient/category/doctor; migrations 013–015 | REQ-0021..0023 |
| 2026-06-04T18:15:00Z | build | REQ-0024 CP admin user Record Audit | AdminUserDetailScreen; userDetailInclude SSR | REQ-0024 |
| 2026-06-04T18:20:00Z | build | REQ-0025 user audit backfill | db:backfill-user-audit; seed-test-user stamp | REQ-0025 |
| 2026-06-04T18:30:00Z | init | Bootstrap C5 + Infinity Loop refresh for tomorrow | STATE C5; agile-v-core.md; Cursor rule; GATE-0009/0010 | REQ-0021..0026 |
| 2026-06-04T18:30:00Z | red-team | C5 automated verification PASS | 742 tests, tsc, lint, build; commits 9785c8d d826ca7 | REQ-0021..0025 |
| 2026-06-04T16:01:00Z | init | Session activation confirm — Infinity Loop always on | ACTIVATION.md; C1..C5 bootstrap intact; 742/742 re-verify | REQ-0021..0026 |
| 2026-06-05T17:40:00Z | init | Bootstrap C6 — invoice violet + visit location parity | REQ-0027..0031; ART-0126..0155; Cursor rule restored | REQ-0027..0031 |
| 2026-06-05T17:40:00Z | build | REQ-0028..0029 invoice violet + entity chrome | cad0b07, 636282e, bcfe6d4 | REQ-0028, REQ-0029 |
| 2026-06-05T17:40:00Z | build | REQ-0030 visit location portal/booking/cards | a31bf78; portal includes + booking POST | REQ-0030 |
| 2026-06-05T17:40:00Z | build | REQ-0031 location fallback doctor portal/dashboard/snapshot | 84967f6, 629c3ed | REQ-0031 |
| 2026-06-05T17:40:00Z | red-team | C6 automated verification PASS | 772 tests, tsc, lint, build; GATE-0011/0012 pending | REQ-0027..0031 |
| 2026-06-07T12:45:00Z | build | REQ-0032 invoice detail patient UX | plain header; PaymentStatusBadge; payment reference labels | REQ-0032 |
