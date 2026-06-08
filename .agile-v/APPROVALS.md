# Human Gate Approvals — HealthCal Pro

<!-- Append-only | 21 CFR Part 11 / Annex 11 style records -->

| GATE-ID | Gate | Cycle | Scope | Decision | Conditions | Approver | Role | Timestamp | Signature Method | Evidence Ref | resume_token | INTERRUPT-ID |
|---------|------|-------|-------|----------|------------|----------|------|-----------|------------------|--------------|--------------|--------------|
| GATE-0001 | 1 | C1 | REQ-0001..0004 | Approved | Implement-as-specified | Arnob Mahmud | Project Maintainer | 2026-05-30T11:00:00Z | Instruction + commit trail | d6ca878..3a563d7 | — | — |
| GATE-0002 | 2 | C1 | REQ-0001..0004 release | Approved | Automated Red Team PASS; 472 tests; build green | Red Team Verifier (automated) | Release Manager (delegated) | 2026-05-30T13:10:00Z | EvalGate ER-C1-CLOSE | 3a563d7 | — | — |
| GATE-0003 | 1 | C2 | REQ-0005..0008 | Approved | Doctor CP + admin roster + dev stubs | Arnob Mahmud | Project Maintainer | 2026-05-31T15:00:00Z | Instruction + commit trail | 2adbbd0..2d9a932 | — | — |
| GATE-0004 | 2 | C2 | REQ-0005..0008 release | Approved | Automated Red Team PASS; 520 tests; build green | Red Team Verifier (automated) | Release Manager (delegated) | 2026-05-31T16:10:00Z | EvalGate ER-C2-CLOSE | 2d9a932 | — | — |
| GATE-0005 | 1 | C3 | REQ-0009..0015 | Pending | Retroactive scope approval | — | — | — | — | ER-C3-VERIFY | — | — |
| GATE-0006 | 2 | C3 | REQ-0009..0015 release | Pending | After GATE-0005; archive cycles/C3 | — | — | — | — | ER-C3-VERIFY | — | — |
| GATE-0007 | 1 | C4 | REQ-0016..0020 | Pending | Invoice + SSE tranche | — | — | — | — | ER-C4-UI-VERIFY | — | — |
| GATE-0008 | 2 | C4 | REQ-0016..0020 release | Pending | After GATE-0007; archive cycles/C4 | — | — | — | — | ER-C4-UI-VERIFY | — | — |
| GATE-0009 | 1 | C5 | REQ-0021..0026 | Pending | Record Audit tranche | — | — | — | — | ER-C5-VERIFY | — | — |
| GATE-0010 | 2 | C5 | REQ-0021..0026 release | Pending | After GATE-0009; archive cycles/C5 | — | — | — | — | ER-C5-VERIFY | — | — |
| GATE-0011 | 1 | C6 | REQ-0027..0031 | Pending | Invoice violet + visit location | — | — | — | — | ER-C6-VERIFY | — | — |
| GATE-0012 | 2 | C6 | REQ-0027..0033 release | Pending | After GATE-0011; archive cycles/C6 | — | — | — | — | ER-C6-VERIFY | — | — |
| GATE-0013 | 1 | C7 | REQ-0034..0037 | Pending | Services + cancel + cron + patient phone | — | — | — | — | ER-C7-VERIFY | — | — |
| GATE-0014 | 2 | C7 | REQ-0034..0037 release | Pending | After GATE-0013; archive cycles/C7 | — | — | — | — | ER-C7-VERIFY | — | — |

## Authority Matrix

See `.agile-v/config.json` → `authority_matrix`.

## Gate 2 Evidence Summary

```
Scope: validated C1 REQ-0001..0004 | Traceability: REQ→ART→VER complete
Findings: PASS 472 / FAIL 0 / FLAG 0
Decision Points: archive to cycles/C1; living STATE → C1 closed
Log: 2026-05-30 | red-team | GATE-0002 Approved | ER-C1-CLOSE | REQ-0001..0004
```
