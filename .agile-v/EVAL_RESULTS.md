---
eval_run_id: ER-C1-CLOSE
eval_timestamp: "2026-05-30T13:10:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C1 closure — npm test 472/472, tsc, eslint, build PASS for REQ-0001..0004"
thresholds:
  first_pass_percent: 80
  requirement_coverage_percent: 100
  regression_pass_percent: 100
cycle: C1
release_commit: "3a563d7"
---

# Eval Results — HealthCal Pro

## Suite Runs (C1 Close)

| Suite | Command | Result | FT-CODE | Notes |
|-------|---------|--------|---------|-------|
| entity-active-status | npm test entity-active-status | PASS | — | REQ-0001 |
| category-query-client | npm test category-query-client | PASS | — | REQ-0002 |
| appointment-mutation-invalidation | npm test appointment-mutation-invalidation | PASS | — | REQ-0003 |
| appointments-calendar-assignees | npm test appointments-calendar-assignees | PASS | — | REQ-0004 |
| query-cache-cross-tab | npm test query-cache-cross-tab | PASS | — | REQ-0004 |
| full regression | npm test | PASS | — | 472/472 |
| typecheck | npx tsc --noEmit | PASS | — | |
| lint | npm run lint | PASS | — | |
| release build | npm run build | PASS | — | Gate 2 RC |

## Prior Runs

| eval_run_id | Scope | Status |
|-------------|-------|--------|
| ER-C1-REQ0001 | REQ-0001 tranche | PASS |

## Eval Gate Status

**PASS** — C1 Human Gate 2 closed with automated Red Team verification. Archived to `.agile-v/cycles/C1/`.

---

## C2 Close — ER-C2-CLOSE

```yaml
eval_run_id: ER-C2-CLOSE
eval_timestamp: "2026-05-31T16:10:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C2 closure — npm test 520/520, tsc, eslint, build PASS for REQ-0005..0008"
cycle: C2
release_commit: "2d9a932"
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 520/520 | REQ-0005..0008 |
| typecheck | npx tsc --noEmit | PASS | REQ-0005..0008 |
| lint | npm run lint | PASS | REQ-0005..0008 |
| release build | npm run build | PASS | REQ-0005..0008 |

**EvalGate (active):** PASS — C2 archived to `.agile-v/cycles/C2/`.

---

## C3 Verify — ER-C3-VERIFY (refresh 2026-06-04)

```yaml
eval_run_id: ER-C3-VERIFY
eval_timestamp: "2026-06-04T12:24:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C3 extended — npm test 666/666 (120 files), tsc, eslint, build PASS for REQ-0009..0015"
cycle: C3
release_commit: "6f13cc2"
human_gate_2: GATE-0006
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| staff-appointment-calendar-scope | npm test staff-appointment-calendar-scope | PASS | REQ-0009, REQ-0013 |
| login-today-appointments | npm test login-today-appointments | PASS | REQ-0013 |
| calendar-clinical-role-filter | npm test calendar-clinical-role-filter | PASS | REQ-0010 |
| invoice-billing-totals | npm test invoice-billing-totals | PASS | REQ-0011, REQ-0015 |
| invoice-paid-period | npm test invoice-paid-period | PASS | REQ-0015 |
| org-billing-prefetch | npm test org-billing-prefetch | PASS | REQ-0012, REQ-0015 |
| insights-period-charts | npm test insights-period-charts | PASS | REQ-0014 |
| clinical-empty-dash | npm test clinical-empty-dash | PASS | REQ-0012 |
| full regression | npm test | PASS 666/666 | REQ-0009..0015 |
| typecheck | npx tsc --noEmit | PASS | REQ-0009..0015 |
| lint | npm run lint | PASS | REQ-0009..0015 |
| release build | npm run build | PASS | REQ-0009..0015 |

**EvalGate (active):** PASS (automated) — Human Gate 2 pending before `cycles/C3/` freeze.

---

## C5 Verify — ER-C5-VERIFY

```yaml
eval_run_id: ER-C5-VERIFY
eval_timestamp: "2026-06-04T18:30:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C5 Record Audit — npm test 742/742 (138 files), tsc, eslint, build PASS for REQ-0021..0025"
cycle: C5
release_commit: "d826ca7"
human_gate_1: GATE-0009
human_gate_2: GATE-0010
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| entity-detail-audit-actor | npm test entity-detail-audit-actor | PASS | REQ-0021 |
| appointment-detail-view-model | npm test appointment-detail-view-model | PASS | REQ-0021, REQ-0023 |
| full regression | npm test | PASS 742/742 | REQ-0021..0025 |
| typecheck | npx tsc --noEmit | PASS | REQ-0021..0025 |
| lint | npm run lint | PASS | REQ-0021..0025 |
| release build | npm run build | PASS | REQ-0021..0025 |

**EvalGate (C5 active):** PASS (automated) — Human Gates 9–10 pending before `cycles/C5/` freeze.

---

## C6 Verify — ER-C6-VERIFY

```yaml
eval_run_id: ER-C6-VERIFY
eval_timestamp: "2026-06-05T17:40:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C6 invoice violet + visit location — npm test 772/772 (145 files), tsc, eslint, build PASS for REQ-0027..0031"
cycle: C6
release_commit: "629c3ed"
human_gate_1: GATE-0011
human_gate_2: GATE-0012
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| appointment-visit-location | npm test appointment-visit-location | PASS | REQ-0030, REQ-0031 |
| full regression | npm test | PASS 772/772 | REQ-0027..0031 |
| typecheck | npx tsc --noEmit | PASS | REQ-0027..0031 |
| lint | npm run lint | PASS | REQ-0027..0031 |
| release build | npm run build | PASS | REQ-0027..0031 |

**EvalGate (C6 active):** PASS (automated) — Human Gates 11–12 pending before `cycles/C6/` freeze.

---

## C7 Verify — ER-C7-VERIFY

```yaml
eval_run_id: ER-C7-VERIFY
eval_timestamp: "2026-06-08T14:15:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C7 services + cancel + cron + patient phone — npm test 829/829 (158 files), tsc, eslint, build PASS for REQ-0034..0037"
cycle: C7
release_commit: "e73a7d0"
human_gate_1: GATE-0013
human_gate_2: GATE-0014
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| appointment-cancel-access | npm test appointment-cancel-access | PASS | REQ-0035 |
| appointment-id-write | npm test appointment-id-write | PASS | REQ-0035 |
| phone-validation | npm test phone-validation | PASS | REQ-0037 |
| reminder-recipient-phone | npm test reminder-recipient-phone | PASS | REQ-0036 |
| full regression | npm test | PASS 829/829 | REQ-0034..0037 |
| typecheck | npx tsc --noEmit | PASS | REQ-0034..0037 |
| lint | npm run lint | PASS | REQ-0034..0037 |
| release build | npm run build | PASS | REQ-0034..0037 |

**EvalGate (C7 active):** PASS (automated) — Human Gates 13–14 pending before `cycles/C7/` freeze.

## C4 Billing Extension — ER-C4-BILLING-EXT

```yaml
eval_run_id: ER-C4-BILLING-EXT
eval_timestamp: "2026-06-04T22:20:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "Lifecycle TS, dialog visit parity, issuer UI, list labels, PDF refund date — 863/863, tsc, eslint, build PASS"
cycle: C4
release_commit: "d2a4cd5"
human_gate_1: GATE-0007
human_gate_2: GATE-0008
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| invoice-detail-action-capabilities | npm test invoice-detail-action-capabilities | PASS | REQ-0018 |
| invoice-pdf-document | npm test invoice-pdf-document | PASS | REQ-0017 |
| invoice-list-meta-status-dates | npm test invoice-list-meta-status-dates | PASS | REQ-0017 |
| full regression | npm test | PASS 863/863 | REQ-0016..0018 |
| typecheck | npx tsc --noEmit | PASS | REQ-0016..0018 |
| lint | npm run lint | PASS | REQ-0016..0018 |
| release build | npm run build | PASS | REQ-0016..0018 |

**EvalGate (C4 billing ext):** PASS (automated) — Human Gates 7–8 pending before `cycles/C4/` freeze.

## C8 — ER-C8-VERIFY

```yaml
eval_run_id: ER-C8-VERIFY
eval_timestamp: "2026-06-09T16:20:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C8 page chrome + admin portal — npm test 863/863, tsc, eslint, build PASS for REQ-0038..0040"
cycle: C8
release_commit: "52ba8f8"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 863/863 | REQ-0038..0040 |
| typecheck | npx tsc --noEmit | PASS | REQ-0038..0040 |
| lint | npm run lint | PASS | REQ-0038..0040 |
| release build | npm run build | PASS | REQ-0038..0040 |

## C8.1 / C9 — ER-C8-C9-VERIFY

```yaml
eval_run_id: ER-C8-C9-VERIFY
eval_timestamp: "2026-06-10T11:50:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C8.1 merged CP header + C9 portal chrome — npm test 863/863 (166 files), tsc, eslint, build PASS for REQ-0041..0045"
cycle: C8.1/C9
release_commit: "bc97070"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 863/863 | REQ-0041..0045 |
| typecheck | npx tsc --noEmit | PASS | REQ-0041..0045 |
| lint | npm run lint | PASS | REQ-0041..0045 |
| release build | npm run build | PASS | REQ-0041..0045 |

**EvalGate (C8.1/C9):** PASS (automated) — Human Gate TBD before `cycles/C8/` freeze.

## C17 — ER-C17-VERIFY

```yaml
eval_run_id: ER-C17-VERIFY
eval_timestamp: "2026-06-11T11:45:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C17 admin table columns + footer interactives — npm test 940/940 (185 files), tsc, eslint, build PASS for REQ-0063"
cycle: C17
release_commit: "5d16082"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 940/940 | REQ-0063 |
| typecheck | npx tsc --noEmit | PASS | REQ-0063 |
| lint | npm run lint | PASS | REQ-0063 |
| release build | npm run build | PASS | REQ-0063 |

**EvalGate (C17):** PASS (automated) — Human Gate TBD before archive.

## C18 — ER-C18-VERIFY

```yaml
eval_run_id: ER-C18-VERIFY
eval_timestamp: "2026-06-11T12:35:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C18 organization management UI parity — npm test 948/948 (189 files), tsc, eslint, build PASS for REQ-0064..0065"
cycle: C18
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 948/948 | REQ-0064..0065 |
| typecheck | npx tsc --noEmit | PASS | REQ-0064..0065 |
| lint | npm run lint | PASS | REQ-0064..0065 |
| release build | npm run build | PASS | REQ-0064..0065 |

**EvalGate (C18):** PASS (automated) — Human Gate TBD before archive.

## C18.1 — ER-C18.1-VERIFY

```yaml
eval_run_id: ER-C18.1-VERIFY
eval_timestamp: "2026-06-11T12:44:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C18.1 org consistency — detail seed, cross-tab invalidation, memberLabel, docs; npm test 954/954, tsc, eslint, build PASS"
cycle: C18.1
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 954/954 | REQ-0064..0065 |
| typecheck | npx tsc --noEmit | PASS | REQ-0064..0065 |
| lint | npm run lint | PASS | REQ-0064..0065 |
| release build | npm run build | PASS | REQ-0064..0065 |

**EvalGate (C18.1):** PASS (automated) — Human Gate TBD before archive.

## C22 — ER-C22-VERIFY

```yaml
eval_run_id: ER-C22-VERIFY
eval_timestamp: "2026-06-12T10:02:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C22 org detail UI parity — Record Audit, enriched members, audit schema/backfill; npm test 975/975, tsc, eslint, build PASS"
cycle: C22
release_commit: "24aa910"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 975/975 | REQ-0065 |
| typecheck | npx tsc --noEmit | PASS | REQ-0065 |
| lint | npm run lint | PASS | REQ-0065 |
| release build | npm run build | PASS | REQ-0065 |

**EvalGate (C22):** PASS (automated) — Human Gate TBD before archive.

## C25 — ER-C25-VERIFY

```yaml
eval_run_id: ER-C25-VERIFY
eval_timestamp: "2026-06-12T13:50:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C25 filter consistency — findFilterOptionLabel DRY, DoctorFilterSelect, services presets; npm test 1001/1001, tsc, eslint, build PASS"
cycle: C25
release_commit: "eb3fb8f"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 1001/1001 | REQ-0069 |
| typecheck | npx tsc --noEmit | PASS | REQ-0069 |
| lint | npm run lint | PASS | REQ-0069 |
| release build | npm run build | PASS | REQ-0069 |

**EvalGate (C25):** PASS (automated) — Human Gate TBD before archive.

## C30 — ER-C30-VERIFY

```yaml
eval_run_id: ER-C30-VERIFY
eval_timestamp: "2026-06-11T20:05:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C30 invoice Record Audit — schema, enrich pipeline, detail parity, date picker, edit hint; npm test 1057/1057, tsc, eslint, build PASS"
cycle: C30
release_commit: "fe84f2b"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| invoice-serialize | npm test invoice-serialize | PASS | REQ-0078 |
| entity-detail-audit-actor | npm test entity-detail-audit-actor | PASS | REQ-0078 |
| invoice-detail-audit-rows | npm test invoice-detail-audit-rows | PASS | REQ-0078 |
| billing-invoice-map | npm test billing-invoice-map | PASS | REQ-0078 |
| full regression | npm test | PASS 1057/1057 | REQ-0078 |
| typecheck | npx tsc --noEmit | PASS | REQ-0078 |
| lint | npm run lint | PASS | REQ-0078 |
| release build | npm run build | PASS | REQ-0078 |

**EvalGate (C30 active):** PASS (automated) — Human Gate TBD before archive.

## C34 — ER-C34-VERIFY

```yaml
eval_run_id: ER-C34-VERIFY
eval_timestamp: "2026-06-13T10:30:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C34/C34.1 stale notification links — link_valid, delete cleanup, UI gating, EntityUnavailableScreen, filter polish; npm test 1103/1103, tsc, eslint, build PASS"
cycle: C34
release_commit: "768a422"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| notification-link | npm test notification-link | PASS | REQ-0082 |
| notification-link-validity | npm test notification-link-validity | PASS | REQ-0082 |
| notification-stale-cleanup | npm test notification-stale-cleanup | PASS | REQ-0082 |
| notification-list-filter | npm test notification-list-filter | PASS | REQ-0082 |
| serialize-notification-row | npm test serialize-notification-row | PASS | REQ-0082 |
| full regression | npm test | PASS 1103/1103 | REQ-0082 |
| typecheck | npx tsc --noEmit | PASS | REQ-0082 |
| lint | npm run lint | PASS | REQ-0082 |
| release build | npm run build | PASS | REQ-0082 |

**EvalGate (C34 active):** PASS (automated) — Human Gate TBD before archive.

## C37 — ER-C37-VERIFY

```yaml
eval_run_id: ER-C37-VERIFY
eval_timestamp: "2026-06-15T12:24:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "C37/C37.1/C37.2 auth login transition + GCal provider remount + sync error policy; npm test 1154/1154, tsc, eslint, build PASS"
cycle: C37
release_commit: "ea40860"
human_gate_2: N/A
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| auth-pending-toast | npm test auth-pending-toast | PASS | — |
| full regression | npm test | PASS 1154/1154 | — |
| typecheck | npx tsc --noEmit | PASS | — |
| lint | npm run lint | PASS | — |
| release build | npm run build | PASS | — |

**EvalGate (C37):** PASS (automated) — engineering hardening; no REQ archive required.

## C38 — ER-C38-VERIFY

```yaml
eval_run_id: ER-C38-VERIFY
eval_timestamp: "2026-06-15T14:00:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "REQ-0088 GCal API warning + connect backfill; regression PASS"
cycle: C38
release_commit: "shipped-on-main"
human_gate_2: TBD
```

## C39 — ER-C39-VERIFY

```yaml
eval_run_id: ER-C39-VERIFY
eval_timestamp: "2026-06-15T16:30:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "REQ-0089/0090 telehealth queue UI + identity UX; 1203/1203; commit 3fd00b1"
cycle: C39
release_commit: "3fd00b1"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| telehealth-queue-* | npm test telehealth-queue | PASS | REQ-0089, REQ-0090 |
| full regression | npm test | PASS 1203/1203 | REQ-0089, REQ-0090 |
| typecheck | npx tsc --noEmit | PASS | REQ-0089, REQ-0090 |
| lint | npm run lint | PASS | REQ-0089, REQ-0090 |
| release build | npm run build | PASS | REQ-0089, REQ-0090 |

## C40 — ER-C40-VERIFY

```yaml
eval_run_id: ER-C40-VERIFY
eval_timestamp: "2026-06-15T17:10:00Z"
policy_version_ref: "1.0.0"
eval_gate_status: PASS
eval_gate_rationale: "REQ-0091 portal telehealth queue + booking preset; 1206/1206; tsc; eslint; build PASS"
cycle: C40
release_commit: "WIP-uncommitted"
human_gate_2: TBD
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| telehealth-scheduling-types | npm test telehealth-scheduling-types | PASS | REQ-0091 |
| full regression | npm test | PASS 1206/1206 | REQ-0091 |
| typecheck | npx tsc --noEmit | PASS | REQ-0091 |
| lint | npm run lint | PASS | REQ-0091 |
| release build | npm run build | PASS | REQ-0091 |

**EvalGate (C40 active):** PASS (automated) — commit pending; Human Gate TBD before archive.

## C41 — ER-C41-VERIFY

```yaml
eval_run_id: ER-C41-VERIFY
eval_timestamp: "2026-06-16T15:30:00Z"
eval_gate_status: PASS
eval_gate_rationale: "REQ-0092 visit-meta badges + invoice SSR; 1220/1220; tsc; eslint; build PASS"
cycle: C41
release_commit: "e8544ee"
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| appointment-visit-meta | npm test appointment-visit-meta | PASS | REQ-0092 |
| full regression | npm test | PASS 1220/1220 | REQ-0092 |
| typecheck | npx tsc --noEmit | PASS | REQ-0092 |
| lint | npm run lint | PASS | REQ-0092 |
| release build | npm run build | PASS | REQ-0092 |

## C42 — ER-C42-VERIFY

```yaml
eval_run_id: ER-C42-VERIFY
eval_timestamp: "2026-06-16T17:50:00Z"
eval_gate_status: PASS
eval_gate_rationale: "REQ-0093 queue glass badges + row glow; 1220/1220; tsc; eslint; build PASS"
cycle: C42.2
release_commit: "2b53b92"
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| full regression | npm test | PASS 1220/1220 | REQ-0093 |
| typecheck | npx tsc --noEmit | PASS | REQ-0093 |
| lint | npm run lint | PASS | REQ-0093 |
| release build | npm run build | PASS | REQ-0093 |

**EvalGate (C42 active):** PASS (automated) — shipped `2b53b92`; ready C43 specify.

## C46 — ER-C46-VERIFY

```yaml
eval_run_id: ER-C46-VERIFY
eval_timestamp: "2026-06-17T15:50:00Z"
eval_gate_status: PASS
eval_gate_rationale: "REQ-0097 portal patients invoice shell + snapshot slimming; 1254/1254; tsc; eslint; build PASS"
cycle: C46
release_commit: "WIP"
```

| Suite | Command | Result | LINKED_REQ |
|-------|---------|--------|------------|
| patient-snapshot-data | npm test patient-snapshot-data | PASS | REQ-0097 |
| portal-patients-layout | npm test portal-patients-layout | PASS | REQ-0097 |
| full regression | npm test | PASS 1254/1254 | REQ-0097 |
| typecheck | npx tsc --noEmit | PASS | REQ-0097 |
| lint | npm run lint | PASS | REQ-0097 |
| release build | npm run build | PASS | REQ-0097 |

**EvalGate (C46 active):** PASS (automated) — commit pending.
