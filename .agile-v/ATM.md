# Automated Traceability Matrix (ATM) — HealthCal Pro

<!-- Cycle: C1..C5 | Last updated: 2026-06-04 | C5 active -->

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
| REQ-0009 | approved [C3] | ART-0049..0054 | C3 | VER-0019..0020 | C3 | PASS |
| REQ-0010 | approved [C3] | ART-0055..0060 | C3 | VER-0021 | C3 | PASS |
| REQ-0011 | approved [C3] | ART-0061..0066, ART-0069 | C3 | VER-0022 | C3 | PASS |
| REQ-0012 | approved [C3] | ART-0067..0068, ART-0070 | C3 | VER-0023..0024 | C3 | PASS |
| REQ-0013 | approved [C3] | ART-0071..0074 | C3 | VER-0025 | C3 | PASS |
| REQ-0014 | approved [C3] | ART-0075..0077 | C3 | VER-0026 | C3 | PASS |
| REQ-0015 | approved [C3] | ART-0078..0085 | C3 | VER-0027..0028 | C3 | PASS |
| REQ-0016 | approved [C4] | ART-0086..0100 | C4 | VER-0029..0037 | C4 | PASS |
| REQ-0017 | approved [C4] | ART-0094..0095 | C4 | VER-0031 | C4 | PASS |
| REQ-0018 | approved [C4] | (main) | C4 | verify C4 | C4 | PASS |
| REQ-0019 | approved [C4] | (main) | C4 | verify C4 | C4 | PASS |
| REQ-0020 | approved [C4] | (main) | C4 | verify C4 | C4 | PASS |
| REQ-0021 | approved [C5] | ART-0101..0108 | C5 | VER-0038..0040 | C5 | PASS |
| REQ-0022 | approved [C5] | ART-0109..0114 | C5 | VER-0041 | C5 | PASS |
| REQ-0023 | approved [C5] | ART-0115..0118 | C5 | VER-0042 | C5 | PASS |
| REQ-0024 | approved [C5] | ART-0119..0122 | C5 | VER-0043 | C5 | PASS |
| REQ-0025 | approved [C5] | ART-0123..0124 | C5 | VER-0044 | C5 | PASS |
| REQ-0026 | approved [C5] | ART-0125 | C5 | — | C5 | constraint |

## Dangling Artifacts

_None._

## Coverage Gaps

| Gap | Risk | Note |
|-----|------|------|
| `invalidateDoctorAssignedPatients` predicate | R2 | No dedicated unit test; covered by integration regression |
| E2E deactivate→409 booking | R2 | Manual QA only |
| Export/sync/search treating-only scope | R2 | Follow-up C4 per CLAUDE.md |
