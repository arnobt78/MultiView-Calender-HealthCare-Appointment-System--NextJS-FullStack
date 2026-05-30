# Trace Log — HealthCal Pro

<!-- Append-only policy/tool spans -->

| Span-ID | Timestamp | Agent | Span Type | Policy Ref | Detail | LINKED_REQ |
|---------|-----------|-------|-----------|------------|--------|------------|
| TRACE-0001 | 2026-05-30T00:00:00Z | init | bootstrap | POLICY.yaml@1.0.0 | Created `.agile-v/` runtime | — |

## Span Types

- `policy` — policy check or gate rule applied
- `tool` — significant tool invocation (test run, build, deploy)
- `gate` — Human Gate interaction
- `decision` — cross-ref DECISION_LOG.md
