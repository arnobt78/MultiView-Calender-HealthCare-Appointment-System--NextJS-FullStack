# Test Specification — HealthCal Pro

<!-- Cycle: C1 | Last updated: 2026-05-30 -->

## Test Cases

| TC-ID | Cycle | REQ-ID | Type | Description | Command / Path | Status |
|-------|-------|--------|------|-------------|----------------|--------|
| — | — | — | — | — | — | — |

## Regression Baseline

| Suite | Command | Scope |
|-------|---------|-------|
| Unit / lib | `npm test` | `src/lib`, `src/app/api` (Vitest) |
| Typecheck | `npx tsc --noEmit` | strict TS |
| Lint | `npm run lint` | ESLint |

## Template

```markdown
### TC-0001 [C1] — [Title]
- **REQ:** REQ-0001
- **Type:** unit | integration | regression | manual
- **Steps:** …
- **Expected:** …
- **Evidence path:** …
```
