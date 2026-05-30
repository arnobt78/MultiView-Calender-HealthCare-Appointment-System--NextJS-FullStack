# Checkpoints — HealthCal Pro

<!-- Durable Human-in-the-loop interrupts | Append-only -->

| INTERRUPT-ID | Created | Gate | Cycle | Scope | Status | resume_token | due_at | Resolved | GATE-ID |
|--------------|---------|------|-------|-------|--------|--------------|--------|----------|---------|
| — | — | — | — | — | — | — | — | — | — |

## Rules

- **PENDING** checkpoints block Gate 2 and forced resume.
- Resume only when `APPROVALS.md` contains matching `resume_token` + `INTERRUPT-ID`.
- On SLA expiry (`due_at`), escalate per `POLICY.yaml` → `hitl.checkpoint_sla_hours`.

## Template

```markdown
### INT-0001
- **Gate:** 1 | 2
- **Status:** PENDING
- **resume_token:** [crypto-random or uuid]
- **Scope:** …
- **Human action required:** …
```
