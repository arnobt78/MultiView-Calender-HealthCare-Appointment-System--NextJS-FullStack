# Phase 04 — Verify — Plan

<!-- SCOPE-V: Verify | Pipeline Stage 4 | Red Team Protocol -->

## Objective

Red Team Verifier executes TEST_SPEC independently; Build Agent does not self-sign-off.

## Steps

1. [ ] Run all TC-XXXX for delta cycle
2. [ ] Run full regression TC-0006 equivalent
3. [ ] Record VER-XXXX in `VALIDATION_SUMMARY.md`
4. [ ] Update `EVAL_RESULTS.md` (`eval_gate_status`)
5. [ ] Hand off to Human Gate 2

## Exit Criteria

- FAIL count = 0 for in-scope REQs
- EvalGate PASS or WAIVED with approver ref
