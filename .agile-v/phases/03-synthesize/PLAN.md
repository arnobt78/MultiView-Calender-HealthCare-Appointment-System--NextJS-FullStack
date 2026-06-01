# Phase 03 — Synthesize — Plan

<!-- SCOPE-V: Orchestrate + Prove | Pipeline Stage 3 -->

## Objective

Build Agent (`build-agent-js`) implements approved REQs; Test Designer authors TCs in parallel (no shared context).

## Steps

1. [ ] Register ART-XXXX in `BUILD_MANIFEST.md` before coding
2. [ ] Implement with SSR in `page.tsx`, client in components
3. [ ] Call correct invalidation helper on every mutation
4. [ ] Test Designer adds TC-XXXX to `TEST_SPEC.md`
5. [ ] `npm test && npx tsc --noEmit && npm run lint`

## Exit Criteria

- All ART rows `built`
- Regression green
- `STATE.md` → Stage 4
