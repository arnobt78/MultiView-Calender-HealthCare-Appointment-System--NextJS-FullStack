# Phase 04 — Verify — Context

```bash
npm test && npx tsc --noEmit && npm run lint && npm run build
```

| Delta tests (C2) | Path |
|------------------|------|
| Doctor revenue | `src/lib/__tests__/doctor-revenue-aggregate.test.ts` (if present) |
| Cross-tab doctors | `src/lib/__tests__/query-cache-cross-tab.test.ts` |
| Patient/doctor access | `src/__tests__/lib/patient-access.test.ts` |

Full suite: 79 files, 520 tests (C2 close).
