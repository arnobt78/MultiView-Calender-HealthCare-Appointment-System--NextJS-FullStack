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
| 2026-06-07T12:55:00Z | build | REQ-0033 badge font-normal + ID clipboard | EntityIdCopyInline; font-normal tokens | REQ-0033 |
| 2026-06-08T14:15:00Z | init | Bootstrap C7 + Agile V refresh | REQ-0034..0037; STATE C7; Cursor rule restored; 829/829 verify | REQ-0034..0037 |
| 2026-06-08T14:15:00Z | build | REQ-0034 services catalog | `dcd4374` brand icons + type filter | REQ-0034 |
| 2026-06-08T14:15:00Z | build | REQ-0035 appointment cancel | cancel RBAC, notify, status badge, CP menu | REQ-0035 |
| 2026-06-08T14:15:00Z | build | REQ-0036 reminder cron | `reminder_sent_at`; optional Brevo SMS opt-in | REQ-0036 |
| 2026-06-08T14:15:00Z | build | REQ-0037 patient phone | form, detail, list, validation, seed-phones | REQ-0037 |
| 2026-06-08T14:15:00Z | red-team | C7 automated verification PASS | `e73a7d0`; 829 tests; GATE-0013/0014 pending | REQ-0034..0037 |
| 2026-06-04T22:00:00Z | build | C4 billing ext — lifecycle TS | migration 016; `cancelled_at`/`refunded_at`; serialize + list footer | REQ-0016..0018 |
| 2026-06-04T22:05:00Z | build | Dialog visit parity + fee strip | `invoice-dialog-visit-display`; summary/picker cards; `buildInvoiceVisitFeeStripLine` | REQ-0016 |
| 2026-06-04T22:10:00Z | build | Doctor issuer UI gate | `doctorCanMutateInvoice`; portal `viewerUserId` wire; API RBAC unchanged | REQ-0018 |
| 2026-06-04T22:12:00Z | build | Billing list labels | `InvoiceVisitDescriptionStack` Patient/Treating/Owner rows | REQ-0017 |
| 2026-06-04T22:15:00Z | build | PDF refund date | `serializeInvoice` on PDF route; `formatPaymentHistoryDate` prefers `refunded_at` | REQ-0017 |
| 2026-06-04T22:20:00Z | red-team | C4 billing ext verify PASS | `d2a4cd5`; 863/863; tsc/lint/build; GATE-0007/0008 pending | REQ-0016..0018 |
| 2026-06-04T15:30:00Z | init | Infinity Loop re-init — framework bootstrap refresh | Cursor rule restored; ACTIVATION/STATE/BOOTSTRAP synced; C1..C7 index; 863/863 re-verify | REQ-0001..0037 |
| 2026-06-09T16:20:00Z | build | C8 page chrome + admin portal redesign | AppPageChrome; 14 CP headers; SSR chrome shell; admin PatientStatCard KPIs; 863/863 | REQ-0038..0040 |
| 2026-06-09T17:30:00Z | build | C8.1 merged CP header + C9 portal chrome | Registry slots fix overlay bug; PortalPageChrome; CP no border-b; dashboard toolbar-only; invalidation unchanged; 863/863 | REQ-0041..0045 |
| 2026-06-10T11:50:00Z | init | Infinity Loop session activation — resume from C8.1/C9 | agile-v-core + pipeline + lifecycle + compliance loaded; STATE/ACTIVATION/BOOTSTRAP refreshed; npm test 863/863; HEAD bc97070; no PENDING checkpoints | REQ-0038..0045 |
| 2026-06-10T12:20:00Z | build | C10 CP list zero-flash SSR + entity list shell | sync seed cp-list-query-ssr-seed; hooks initialData; ControlPanelEntityListShell; category detail anti-flash; 863/863 tsc lint build | REQ-0046..0049 |
| 2026-06-10T18:00:00Z | build | C10.1 CP chrome zero-flash extension | sync chrome registry + action shells; navbar SSR auth/me seed; admin-all visit types prefetch; remaining CP tab seeds + useCpListBodyLoading | REQ-0050..0052 |
| 2026-06-10T19:30:00Z | build | C10.2 CP polish gap closure | notifications initialData; SSR action shells RSC; org actions slot; EntityListShell orgs/appts; billing/patient detail loading | REQ-0053 |
| 2026-06-10T21:00:00Z | build | C11 global isMounted parity | useQueryBodyLoading; remove isMounted from portal/insights/detail/scheduling; notifications cross-tab helper | REQ-0054 |
| 2026-06-10T22:30:00Z | build | C12 CP chrome subtitle + action parity | inline subtitle skeleton; Refresh SSR shell; HeaderGlassButton h-10; notifications toolbar split | REQ-0055 |
| 2026-06-10T23:45:00Z | build | C12.1 CP chrome tab isolation | tab-scoped sync store reset; server snapshot; Export CSV literal; overview subtitle error path | REQ-0056 |
| 2026-06-10T24:15:00Z | build | C12.2 CP chrome polish | slim context; aligned SSR snapshot; description wrapper fix; admin detail subtitle | REQ-0057 |
| 2026-06-10T25:00:00Z | build | C13 user-admin UI parity + chrome remount | reinitializeControlPanelChromeTab; admin list filters/stats; emerald dialog; detail appointments SSR | REQ-0059 |
| 2026-06-11T11:45:00Z | init | Infinity Loop session activation — resume from C17 | agile-v-core + pipeline + lifecycle + compliance loaded; STATE/ACTIVATION/BOOTSTRAP/AGENTS/config synced; npm test 940/940; HEAD 5d16082; no PENDING checkpoints | REQ-0063 |
| 2026-06-11T12:00:00Z | init | agile-v-core activate — before-coding gate on every prompt | ACTIVATION.md §3 pipeline gate; C17 WIP cursor-pointer dedupe uncommitted; halt without REQ | REQ-0063 |
| 2026-06-11T14:00:00Z | build | C18 specify — organization management UI parity | REQ-0064 list + REQ-0065 detail/billing; patient-management CP pattern | REQ-0064..0065 |
| 2026-06-11T16:35:00Z | build | C18 org CP parity shipped | enriched API; indigo list shell; compact+full billing; glass dialogs; detail CRUD; 948/948 | REQ-0064..0065 |
| 2026-06-11T17:45:00Z | build | C18.1 org consistency gaps | detail loader/seed; cross-tab invalidation; memberLabel toast; walkthrough; 954/954 | REQ-0064..0065 |
| 2026-06-11T19:00:00Z | build | C18.2 org detail hook + cache parity | useOrganizationDetail; organization-detail-client merges; enriched POST members; 960/960 | REQ-0065 |
| 2026-06-11T20:30:00Z | build | C19 org list UI polish | indigoGlassTableFrameClass; EntityTitleLink; UserRoleBadge; actions menu; demo patient org member; 961/961 | REQ-0064 |
| 2026-06-11T21:15:00Z | build | C19.1 detail member badges + org patient seed script | UserRoleBadge on detail members; db:seed-org-portal-patient-member | REQ-0064 |
| 2026-06-11T22:30:00Z | build | C20 org billing UI parity | PortalPanelSection shell; possessive title + status inline row; filters on compact+full; Invoice N: #id on portal lists; 966/966 | REQ-0065 |
| 2026-06-11T23:30:00Z | build | C21 org dialog UX parity | OrganizationDialogHeader; indigo pickers; role auto-fill; create initialMembers transaction; 970/970 | REQ-0065 |
| 2026-06-11T16:30:00Z | build | C22 org detail UI parity | Record Audit card; org audit schema; rich owner/member rows; CP table shells; ⋮ member actions; 975/975 | REQ-0065 |
| 2026-06-12T10:05:00Z | ops | Agile V session activation | Refreshed ACTIVATION/STATE/AGENTS/VALIDATION/EVAL/BUILD_MANIFEST; C22 Accept; ready C23 Specify | REQ-0065 |
| 2026-06-12T14:00:00Z | specify | C23 doctor CP + org members UI | REQ-0066: billing-style members header, identity cell parity, doctorUsers section prefetch | REQ-0066 |
| 2026-06-12T14:30:00Z | verify | C23 shipped | Members billing header, identity cells, doctorUsers prefetch, CP assigned patients header; 982/982 | REQ-0066 |
| 2026-06-12T15:00:00Z | specify | C23.1 members filter row | REQ-0067: ClinicalListFilterToolbar + role dropdown above org members table | REQ-0067 |
| 2026-06-12T15:35:00Z | verify | C23.1 shipped | Members filter toolbar + pure filter lib; 990/990 | REQ-0067 |
| 2026-06-12T16:00:00Z | specify | C24 rich filter dropdowns | REQ-0068: FilterSelect icon/color presets + billing footer border | REQ-0068 |
| 2026-06-12T16:30:00Z | verify | C24 shipped | Rich filter presets app-wide; org billing footer border fix; 997/997 | REQ-0068 |
| 2026-06-12T18:00:00Z | specify | C25 filter consistency | REQ-0069: findFilterOptionLabel DRY + DoctorFilterSelect + services presets | REQ-0069 |
| 2026-06-12T18:30:00Z | verify | C25 shipped | DoctorFilterSelect; calendar label DRY; services presets; 1001/1001 | REQ-0069 |
| 2026-06-12T13:50:00Z | activate | C25 Infinity Loop refresh | ACTIVATION/BOOTSTRAP/config synced; baseline 1001/1001; HEAD eb3fb8f | — |
