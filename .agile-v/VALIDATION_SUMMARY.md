# Validation Summary — HealthCal Pro

<!-- Cycle: C1 | REQ-0001..0004 | Last updated: 2026-05-30 | Gate 2: CLOSED -->

## Scope

| Item | Value |
|------|-------|
| Cycle | C1 |
| ART-IDs | ART-0001..ART-0033 |
| REQ-IDs | REQ-0001, REQ-0002, REQ-0003, REQ-0004 |
| TC count | TC-0001..0009 |
| Regression | 472/472 Vitest |

## Results

| Result | Count |
|--------|-------|
| PASS | 472 |
| FAIL | 0 |
| FLAG | 0 |

## Verification Records

| VER-ID | TC-ID | REQ-ID | Result | FT-CODE | Description |
|--------|-------|--------|--------|---------|-------------|
| VER-0001 | TC-0001 | REQ-0001 | PASS | — | entity-active-status Vitest suite |
| VER-0002 | TC-0006 | REQ-0001 | PASS | — | npm test regression (C1 tranche 1) |
| VER-0003 | TC-0007 | REQ-0001 | PASS | — | npx tsc --noEmit |
| VER-0004 | TC-0008 | REQ-0001 | PASS | — | npm run lint |
| VER-0005 | TC-0002 | REQ-0002 | PASS | — | category-query-client + assignee partition |
| VER-0006 | TC-0006 | REQ-0002 | PASS | — | npm test 455+, tsc, lint, build |
| VER-0007 | TC-0003 | REQ-0003 | PASS | — | appointment-mutation-invalidation tests |
| VER-0008 | TC-0006 | REQ-0003 | PASS | — | npm test 459+, tsc, lint, build |
| VER-0009 | TC-0004 | REQ-0004 | PASS | — | appointments-calendar-assignees tests |
| VER-0010 | TC-0005 | REQ-0004 | PASS | — | ORGANIZATIONS cross-tab scope test |
| VER-0011 | TC-0006 | REQ-0004 | PASS | — | npm test 472/472 |
| VER-0012 | TC-0009 | REQ-0004 | PASS | — | npm run build |

## Coverage

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0001 | TC-0001 + regression | PASS |
| REQ-0002 | TC-0002 + regression | PASS |
| REQ-0003 | TC-0003 + regression | PASS |
| REQ-0004 | TC-0004, TC-0005 + regression + build | PASS |

## Red Team Sign-Off

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-05-30T13:10:00Z |
| Evidence | commit `3a563d7`, 472 tests, build PASS |
| LINKED_REQ | REQ-0001..0004 |

## Audit Trail

| Timestamp | Agent | Entry | LINKED_REQ |
|-----------|-------|-------|------------|
| 2026-05-30 | build | Category management refactor complete | REQ-0001 |
| 2026-05-30 | build | Invalidation + portal category live | REQ-0002, REQ-0003 |
| 2026-05-30 | build | SSR prefetch + batch assignee fetch | REQ-0004 |
| 2026-05-30 | red-team | C1 Gate 2 automated verification PASS | REQ-0001..0004 |

---

EvalGate: status=PASS | eval_run_id=ER-C1-CLOSE | policy_version_ref=1.0.0 | eval_results_path=.agile-v/EVAL_RESULTS.md

---

## C2 — Doctor CP Tranche (closed 2026-05-31)

| Item | Value |
|------|-------|
| Cycle | C2 |
| ART-IDs | ART-0034..ART-0048 |
| REQ-IDs | REQ-0005..REQ-0008 |
| Regression | 520/520 Vitest |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0013 | TC-0010 | REQ-0005 | PASS | Doctor tranche regression |
| VER-0014 | TC-0013 | REQ-0005 | PASS | Full suite at C2 synthesis |
| VER-0015 | TC-0011 | REQ-0006 | PASS | Patient access tests |
| VER-0016 | TC-0012 | REQ-0007 | PASS | Cross-tab doctors scope |
| VER-0017 | TC-0014 | REQ-0008 | PASS | tsc strict |
| VER-0018 | TC-0015 | REQ-0008 | PASS | lint + build |

EvalGate (C2): status=PASS | eval_run_id=ER-C2-CLOSE | release_commit=2d9a932

---

## C3 — Calendar scope + filters + billing (bootstrap 2026-06-01)

| Item | Value |
|------|-------|
| Cycle | C3 |
| ART-IDs | ART-0049..ART-0068 |
| REQ-IDs | REQ-0009..REQ-0012 |
| Mode | Retroactive (code on `main` before Gate 1) |
| Regression | 666/666 Vitest (120 files) — refresh 2026-06-04 |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0019 | TC-0016 | REQ-0009 | PASS | Staff appointment calendar scope |
| VER-0020 | TC-0016 | REQ-0009 | PASS | Full regression at C3 verify |
| VER-0021 | TC-0017 | REQ-0010 | PASS | Clinical role + filter empty state |
| VER-0022 | TC-0018 | REQ-0011 | PASS | Invoice billing totals (outstanding excludes refunded) |
| VER-0023 | TC-0019 | REQ-0012 | PASS | Org billing prefetch + clinical empty dash |
| VER-0024 | TC-0020 | REQ-0009..0012 | PASS | tsc + lint + build |
| VER-0025 | TC-0021 | REQ-0013 | PASS | Assignee scope export/sync/search/portal |
| VER-0026 | TC-0022 | REQ-0014 | PASS | Telehealth View-as period share |
| VER-0027 | TC-0023 | REQ-0015 | PASS | Invoice revenue KPI + paid period |
| VER-0028 | TC-0024 | REQ-0009..0015 | PASS | Full regression 666 + tsc + lint + build |

## Coverage (C3)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0009 | TC-0016 + regression | PASS |
| REQ-0010 | TC-0017 + regression | PASS |
| REQ-0011 | TC-0018 + regression | PASS |
| REQ-0012 | TC-0019 + regression | PASS |
| REQ-0013 | TC-0021 + regression | PASS |
| REQ-0014 | TC-0022 + regression | PASS |
| REQ-0015 | TC-0023 + regression | PASS |

## Red Team Sign-Off (C3)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-04T12:24:00Z |
| Evidence | commits `faee3f7`, `6f13cc2`; 666 tests (120 files) |
| LINKED_REQ | REQ-0009..0015 |
| Human Gate 2 | pending GATE-0006 |

EvalGate (C3): status=PASS | eval_run_id=ER-C3-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0006

---

## C4 — Invoice UI parity tranche (2026-06-04)

| Item | Value |
|------|-------|
| Cycle | C4 (draft REQs) |
| ART-IDs | ART-0086..ART-0097 |
| REQ-IDs | REQ-0016, REQ-0017 (UI); REQ-0018..0020 unchanged |
| Regression | 667/667 Vitest (120 files) |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0029 | TC-0025 | REQ-0016 | PASS | `billing-visit-fee` default €150 fallback + options-load |
| VER-0030 | TC-0025 | REQ-0016 | PASS | CP invoice DataTable + filters + visit picker amber |
| VER-0031 | TC-0026 | REQ-0017 | PASS | Invoice detail glass + linked visit + audit card |
| VER-0032 | TC-0025 | REQ-0016 | PASS | Doctor profile seed unify (`doctor-profile-seed-data.ts`) |
| VER-0033 | TC-0025..0017 | PASS | tsc + lint + build |

## Coverage (C4 draft)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0016 | TC-0025 + regression | PASS (automated) |
| REQ-0017 | TC-0026 + regression | PASS (automated) |
| REQ-0018 | — | verify-only (prior tranche) |
| REQ-0019 | — | deferred |
| REQ-0020 | — | out of scope |

## Red Team Sign-Off (C4 tranche)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-04T13:20:00Z |
| Evidence | 667 tests, tsc, lint, build PASS |
| LINKED_REQ | REQ-0016, REQ-0017 |
| Human Gate 2 | pending (C4 not archived) |

EvalGate (C4-UI): status=PASS | eval_run_id=ER-C4-UI-VERIFY | policy_version_ref=1.0.0

## C4 polish tranche (2026-06-04)

| Item | Value |
|------|-------|
| ART-IDs | ART-0098..ART-0100 |
| Regression | 671/671 Vitest (121 files) |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0034 | REQ-0016 | PASS | ClinicalGlassDatePicker + location hint |
| VER-0035 | REQ-0016 | PASS | Doctor portal invoice-table-cells parity |
| VER-0036 | REQ-0016 | PASS | db:seed-demo-full / db:seed-doctor-profiles |
| VER-0037 | REQ-0016 | PASS | tsc + lint + build |

---

## C5 — Entity detail Record Audit (2026-06-04)

| Item | Value |
|------|-------|
| Cycle | C5 |
| ART-IDs | ART-0101..ART-0125 |
| REQ-IDs | REQ-0021..REQ-0026 |
| Regression | **742/742** Vitest (138 files) |
| Commits | `9785c8d`, `d826ca7` |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0038 | TC-0027 | REQ-0021 | PASS | `entity-detail-audit-actor.test.ts` |
| VER-0039 | TC-0027 | REQ-0021 | PASS | `appointment-detail-view-model.test.ts` audit actors |
| VER-0040 | TC-0027 | REQ-0021 | PASS | Full regression 742 |
| VER-0041 | TC-0028 | REQ-0022 | PASS | Serializer + include contract (regression) |
| VER-0042 | TC-0029 | REQ-0023 | PASS | Invoice audit rows + view-model |
| VER-0043 | TC-0030 | REQ-0024 | PASS | Admin user detail SSR + mapper |
| VER-0044 | TC-0031 | REQ-0025 | PASS | Backfill script idempotent (0/0 when stamped) |
| VER-0045 | REQ-0021..0026 | PASS | tsc + lint + build |

## Coverage (C5)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0021 | TC-0027 + regression | PASS |
| REQ-0022 | TC-0028 + regression | PASS |
| REQ-0023 | TC-0029 + regression | PASS |
| REQ-0024 | TC-0030 + regression | PASS |
| REQ-0025 | TC-0031 | PASS |
| REQ-0026 | — | constraint (no VER) |

## Red Team Sign-Off (C5)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-04T18:30:00Z |
| Evidence | `9785c8d`, `d826ca7`; 742 tests |
| LINKED_REQ | REQ-0021..0025 |
| Human Gate 2 | pending GATE-0010 |

EvalGate (C5): status=PASS | eval_run_id=ER-C5-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0010

---

## C6 — Invoice violet + visit location (2026-06-05)

| Item | Value |
|------|-------|
| Cycle | C6 |
| ART-IDs | ART-0126..ART-0155 |
| REQ-IDs | REQ-0027..REQ-0031 |
| Regression | **772/772** Vitest (145 files) |
| Commits | `629c3ed`, `84967f6`, `a31bf78`, `bcfe6d4`, `636282e`, `cad0b07`, `29fd3b5` |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0046 | TC-0032 | REQ-0027 | PASS | Visit fee badge + booking fee display tests |
| VER-0047 | TC-0032 | REQ-0027 | PASS | Full regression at C6 start |
| VER-0048 | TC-0033 | REQ-0028 | PASS | Invoice detail capabilities + PDF route |
| VER-0049 | TC-0033 | REQ-0029 | PASS | Violet dialog classes + entity chrome |
| VER-0050 | TC-0034 | REQ-0030 | PASS | `appointment-visit-location.test.ts` |
| VER-0051 | TC-0035 | REQ-0031 | PASS | Doctor portal + dashboard location embed |
| VER-0052 | TC-0036 | REQ-0031 | PASS | Snapshot location resolver test |
| VER-0053 | REQ-0027..0031 | PASS | tsc + lint + build |
| VER-0054 | TC-0037 | REQ-0027..0031 | PASS | Full regression **772/772** |

## Coverage (C6)

| REQ-ID | Tests | Status |
|--------|-------|--------|
| REQ-0027 | TC-0032 + regression | PASS |
| REQ-0028 | TC-0033 + regression | PASS |
| REQ-0029 | TC-0033 + regression | PASS |
| REQ-0030 | TC-0034 + regression | PASS |
| REQ-0031 | TC-0035..0036 + regression | PASS |

## Red Team Sign-Off (C6)

| Field | Value |
|-------|-------|
| Agent | Red Team Verifier (automated) |
| Timestamp | 2026-06-05T17:40:00Z |
| Evidence | `629c3ed`; 772 tests, tsc, lint, build |
| LINKED_REQ | REQ-0027..0031 |
| Human Gate 2 | pending GATE-0012 |

EvalGate (C6): status=PASS | eval_run_id=ER-C6-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0012

---

## C6 extension — Invoice detail patient UX (2026-06-07)

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0055 | REQ-0032 | PASS | payment-status-display tests |
| VER-0056 | REQ-0032 | PASS | invoice-list-row-display demo slug fallback |
| VER-0057 | REQ-0032 | PASS | Full regression **780/780** + tsc + lint + build |

---

## C6 extension — Badge font-normal + ID clipboard (2026-06-07)

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0058 | REQ-0033 | PASS | entity-id-display + copy-to-clipboard tests |
| VER-0059 | REQ-0033 | PASS | EntityIdCopyInline wired on detail + payment surfaces |
| VER-0060 | REQ-0033 | PASS | Full regression **786/786** + tsc + lint + build |

---

## C7 — Services catalog + cancel + cron + patient phone (2026-06-08)

| Item | Value |
|------|-------|
| Cycle | C7 |
| ART-IDs | ART-0169..ART-0192 |
| REQ-IDs | REQ-0034..REQ-0037 |
| Regression | **829/829** Vitest (158 files) |
| Commits | `dcd4374`, `e73a7d0` |

| VER-ID | TC-ID | REQ-ID | Result | Description |
|--------|-------|--------|--------|-------------|
| VER-0061 | TC-0038 | REQ-0034 | PASS | Services catalog shipped `dcd4374` |
| VER-0062 | TC-0038 | REQ-0034 | PASS | Regression at C7 start |
| VER-0063 | TC-0039 | REQ-0035 | PASS | `appointment-cancel-access.test.ts` |
| VER-0064 | TC-0039 | REQ-0035 | PASS | `appointment-id-write.test.ts` |
| VER-0065 | TC-0040 | REQ-0035 | PASS | Status badge + card cancelled tests |
| VER-0066 | TC-0041 | REQ-0036 | PASS | Cron + reminder phone resolver tests |
| VER-0067 | TC-0042 | REQ-0037 | PASS | `phone-validation` + `patient-form-clinical` |
| VER-0068 | TC-0043 | REQ-0034..0037 | PASS | Full regression **829/829** + tsc + lint + build |

EvalGate (C7): status=PASS | eval_run_id=ER-C7-VERIFY | policy_version_ref=1.0.0 | gate2_pending=GATE-0014

---

## C4 billing extension — lifecycle, dialog parity, issuer UI, PDF (2026-06-04)

| Item | Value |
|------|-------|
| Cycle | C4 ext |
| ART-IDs | ART-0193..ART-0201 |
| REQ-IDs | REQ-0016..REQ-0018 |
| Regression | **863/863** Vitest (166 files) |
| HEAD | `d2a4cd5` |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0069 | REQ-0016 | PASS | Lifecycle TS migration + serialize + list footer |
| VER-0070 | REQ-0016 | PASS | Dialog visit parity + fee strip |
| VER-0071 | REQ-0018 | PASS | `doctorCanMutateInvoice` + portal wire |
| VER-0072 | REQ-0017 | PASS | Patient/Treating/Owner list labels |
| VER-0073 | REQ-0017 | PASS | PDF `refunded_at` payment history |
| VER-0074 | REQ-0016..0018 | PASS | Full regression **863/863** + tsc + lint + build |

EvalGate (C4 ext): status=PASS | eval_run_id=ER-C4-BILLING-EXT | gate2_pending=GATE-0008

---

## C8 — Unified page chrome + admin portal redesign (2026-06-09)

| Item | Value |
|------|-------|
| Cycle | C8 |
| ART-IDs | ART-0202..ART-0216 |
| REQ-IDs | REQ-0038..REQ-0040 |
| Regression | **863/863** Vitest (166 files) |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0075 | REQ-0038 | PASS | AppPageChrome + 14 CP section headers |
| VER-0076 | REQ-0039 | PASS | SSR chrome shell + listBodyLoading warm-cache |
| VER-0077 | REQ-0040 | PASS | Admin portal PatientStatCard KPIs + shared list patterns |
| VER-0078 | REQ-0038..0040 | PASS | Full regression **863/863** + tsc + lint + build |

EvalGate (C8): status=PASS | eval_run_id=ER-C8-VERIFY | gate2_pending=TBD

---

## C8.1 / C9 — Merged CP header + portal chrome (2026-06-09)

| Item | Value |
|------|-------|
| Cycle | C8.1 + C9 |
| ART-IDs | ART-0217..ART-0223 |
| REQ-IDs | REQ-0041..REQ-0045 |
| Regression | **863/863** Vitest (166 files) |
| HEAD | `bc97070` |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0079 | REQ-0041 | PASS | ControlPanelChromeActions registry; merged sticky header row |
| VER-0080 | REQ-0042 | PASS | PortalPageChrome + portal-page-chrome-config |
| VER-0081 | REQ-0043 | PASS | EntityDetailChromeHeader + PortalDoctorChromeHeader → AppPageChrome |
| VER-0082 | REQ-0044 | PASS | Dashboard toolbar-only CalendarHeader (no portal chrome key) |
| VER-0083 | REQ-0045 | PASS | CP no border-b; prefetch/invalidation unchanged |
| VER-0084 | REQ-0041..0045 | PASS | Full regression **863/863** re-verify 2026-06-10 |

EvalGate (C8.1/C9): status=PASS | eval_run_id=ER-C8-C9-VERIFY | gate2_pending=TBD

---

## C10–C16 — CP zero-flash, chrome polish, entity detail, user-admin (2026-06-10)

| Item | Value |
|------|-------|
| Cycle | C10..C16 |
| ART-IDs | ART-0224..ART-0309 |
| REQ-IDs | REQ-0046..0062 |
| Regression | **930/930** → **940/940** Vitest (185 files) |

EvalGate (C10–C16): status=PASS | eval_run_id=ER-C10-C16-VERIFY | gate2_pending=TBD

---

## C17 — Admin table columns + detail footer interactives (2026-06-10)

| Item | Value |
|------|-------|
| Cycle | C17 |
| ART-IDs | ART-0310..0313 |
| REQ-IDs | REQ-0063 |
| Regression | **940/940** Vitest (185 files) |
| HEAD | `5d16082` |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0085 | REQ-0063 | PASS | `cpClinicalList*ColumnShellClass`; admin table min-w; cursor-pointer glass tokens |
| VER-0086 | REQ-0063 | PASS | VideoCall triggerClassName + skyGlassBackButtonClass on detail footer |
| VER-0087 | REQ-0063 | PASS | Full regression **940/940** re-verify 2026-06-11 |

EvalGate (C17): status=PASS | eval_run_id=ER-C17-VERIFY | gate2_pending=TBD

---

## C18 — Organization management UI parity (2026-06-11)

| Item | Value |
|------|-------|
| Cycle | C18 |
| ART-IDs | ART-0314..0325 |
| REQ-IDs | REQ-0064, REQ-0065 |
| Regression | **948/948** Vitest (189 files) |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0088 | REQ-0064 | PASS | Indigo list shell, stats, filters, DataTable, enriched org API |
| VER-0089 | REQ-0064 | PASS | Compact billing panels — InvoicePortalListCard top-3 + KPI |
| VER-0090 | REQ-0065 | PASS | Detail billing full panel, glass dialogs, member CRUD |
| VER-0091 | REQ-0065 | PASS | invalidateOrganizationDetail + invoice org-scoped bust |
| VER-0092 | REQ-0064..0065 | PASS | Full regression **948/948** |

EvalGate (C18): status=PASS | eval_run_id=ER-C18-VERIFY | gate2_pending=TBD

---

## C18.1 — Organization consistency gap closure (2026-06-11)

| Item | Value |
|------|-------|
| Cycle | C18.1 |
| REQ-IDs | REQ-0064, REQ-0065 (polish) |
| Regression | **954/954** Vitest (190 files) |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0093 | REQ-0065 | PASS | `loadOrganizationDetailForUser` + detail/members TanStack seed |
| VER-0094 | REQ-0065 | PASS | Hover prefetch `/control-panel/organizations/:id` |
| VER-0095 | REQ-0065 | PASS | `invalidateOrganizationDetail` cross-tab ORGANIZATIONS + INVOICES_BILLING |
| VER-0096 | REQ-0065 | PASS | Add-member toast `memberLabel` from picker |
| VER-0097 | REQ-0064..0065 | PASS | Full regression **954/954** |

EvalGate (C18.1): status=PASS | eval_run_id=ER-C18.1-VERIFY | gate2_pending=TBD

---

## C19 — Org list UI polish (2026-06-11)

| Item | Value |
|------|-------|
| Cycle | C19 |
| REQ-IDs | REQ-0064 |
| Regression | **961/961** Vitest |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0098 | REQ-0064 | PASS | `indigoGlassTableFrameClass`; EntityTitleLink; actions menu |
| VER-0099 | REQ-0064 | PASS | Full regression **961/961** |

EvalGate (C19): status=PASS | eval_run_id=ER-C19-VERIFY | gate2_pending=TBD

---

## C20 — Org billing UI parity (2026-06-11)

| Item | Value |
|------|-------|
| Cycle | C20 |
| REQ-IDs | REQ-0065 |
| Regression | **966/966** Vitest |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0100 | REQ-0065 | PASS | PortalPanelSection; possessive title; status inline; portal card density |
| VER-0101 | REQ-0065 | PASS | Full regression **966/966** |

EvalGate (C20): status=PASS | eval_run_id=ER-C20-VERIFY | gate2_pending=TBD

---

## C21 — Org dialog UX parity (2026-06-11)

| Item | Value |
|------|-------|
| Cycle | C21 |
| REQ-IDs | REQ-0065 |
| Regression | **970/970** Vitest |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0102 | REQ-0065 | PASS | Rich indigo pickers; role auto-fill; initialMembers API |
| VER-0103 | REQ-0065 | PASS | Picker clear + form reset on dialog close |
| VER-0104 | REQ-0065 | PASS | Full regression **970/970** |

EvalGate (C21): status=PASS | eval_run_id=ER-C21-VERIFY | gate2_pending=TBD

---

## C22 — Org detail UI parity (2026-06-12)

| Item | Value |
|------|-------|
| Cycle | C22 |
| REQ-IDs | REQ-0065 |
| Regression | **975/975** Vitest (195 files) |
| HEAD | `24aa910` |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0105 | REQ-0065 | PASS | Record Audit card + org audit schema/backfill |
| VER-0106 | REQ-0065 | PASS | Rich owner + members heading + CP table shells |
| VER-0107 | REQ-0065 | PASS | Member identity cells + OrganizationMemberRowActions ⋮ |
| VER-0108 | REQ-0065 | PASS | Loader enrichment; invalidateOrganizationDetail intact |
| VER-0109 | REQ-0065 | PASS | Full regression **975/975** tsc lint build |

EvalGate (C22): status=PASS | eval_run_id=ER-C22-VERIFY | gate2_pending=TBD

---

## C23 — Org detail members parity (2026-06-12)

| Item | Value |
|------|-------|
| Cycle | C23 |
| REQ-IDs | REQ-0066 |
| Regression | **982/982** Vitest |

EvalGate (C23): status=PASS | eval_run_id=ER-C23-VERIFY | gate2_pending=TBD

---

## C23.1 — Org members filter toolbar (2026-06-12)

| Item | Value |
|------|-------|
| Cycle | C23.1 |
| REQ-IDs | REQ-0067 |
| Regression | **990/990** Vitest |

EvalGate (C23.1): status=PASS | eval_run_id=ER-C23.1-VERIFY | gate2_pending=TBD

---

## C24 — Rich filter dropdowns (2026-06-12)

| Item | Value |
|------|-------|
| Cycle | C24 |
| REQ-IDs | REQ-0068 |
| Regression | **997/997** Vitest (200 files) |

EvalGate (C24): status=PASS | eval_run_id=ER-C24-VERIFY | gate2_pending=TBD

---

## C25 — Filter label DRY + DoctorFilterSelect (2026-06-12)

| Item | Value |
|------|-------|
| Cycle | C25 |
| REQ-IDs | REQ-0069 |
| Regression | **1001/1001** Vitest (201 files) |
| HEAD | `eb3fb8f` |

| VER-ID | REQ-ID | Result | Description |
|--------|--------|--------|-------------|
| VER-0110 | REQ-0069 | PASS | findFilterOptionLabel calendar + empty chips |
| VER-0111 | REQ-0069 | PASS | DoctorFilterSelect + userToDoctorIdentity |
| VER-0112 | REQ-0069 | PASS | Services specialty/weekday presets |
| VER-0113 | REQ-0069 | PASS | Full regression **1001/1001** tsc lint build |

EvalGate (C25): status=PASS | eval_run_id=ER-C25-VERIFY | gate2_pending=TBD
