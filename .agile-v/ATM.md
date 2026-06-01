# Automated Traceability Matrix (ATM) — HealthCal Pro

<!-- Cycle: C1+C2 | Last updated: 2026-05-31 | C2 Gate 2 closed -->

## Matrix

| REQ-ID | Status | ART-ID | ART Cycle | VER-ID | VER Cycle | Result |
|--------|--------|--------|-----------|--------|-----------|--------|
| REQ-0001 | approved [C1] | ART-0001..0015 | C1 | VER-0001..0004 | C1 | PASS |
| REQ-0002 | approved [C1] | ART-0016..0019 | C1 | VER-0005..0006 | C1 | PASS |
| REQ-0003 | approved [C1] | ART-0020..0022 | C1 | VER-0007..0008 | C1 | PASS |
| REQ-0004 | approved [C1] | ART-0023..0033 | C1 | VER-0009..0012 | C1 | PASS |
| REQ-0005 | approved [C2] | ART-0034..0039 | C2 | VER-0013..0014 | C2 | PASS |
| REQ-0006 | approved [C2] | ART-0040..0043 | C2 | VER-0015 | C2 | PASS |
| REQ-0007 | approved [C2] | ART-0044..0045 | C2 | VER-0016 | C2 | PASS |
| REQ-0008 | approved [C2] | ART-0046..0048 | C2 | VER-0017..0018 | C2 | PASS |

## Dangling Artifacts

_None._

## Coverage Gaps

| Gap | Risk | Note |
|-----|------|------|
| `invalidateDoctorAssignedPatients` predicate | R2 | No dedicated unit test; covered by integration regression |
| E2E deactivate→409 booking | R2 | Manual QA only |
