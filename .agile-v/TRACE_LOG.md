# Trace Log — HealthCal Pro

<!-- Append-only policy/tool spans -->

| Span-ID | Timestamp | Agent | Span Type | Policy Ref | Detail | LINKED_REQ |
|---------|-----------|-------|-----------|------------|--------|------------|
| TRACE-0001 | 2026-05-30T00:00:00Z | init | bootstrap | POLICY.yaml@1.0.0 | Created `.agile-v/` runtime | — |
| TRACE-0002 | 2026-05-30T13:10:00Z | red-team | tool | POLICY.yaml@1.0.0 | npm test 472/472 | REQ-0001..0004 |
| TRACE-0003 | 2026-05-30T13:10:00Z | red-team | tool | POLICY.yaml@1.0.0 | npm run build PASS | REQ-0001..0004 |
| TRACE-0004 | 2026-05-30T13:10:00Z | compliance | gate | POLICY.yaml@1.0.0 | GATE-0002 closed; archive cycles/C1 | REQ-0001..0004 |

## Span Types

- `policy` — policy check or gate rule applied
- `tool` — significant tool invocation (test run, build, deploy)
- `gate` — Human Gate interaction
- `decision` — cross-ref DECISION_LOG.md
