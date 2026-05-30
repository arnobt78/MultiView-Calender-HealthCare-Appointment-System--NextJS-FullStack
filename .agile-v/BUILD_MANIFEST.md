# Build Manifest — HealthCal Pro

<!-- Cycle: C1 | Last updated: 2026-05-30 -->

## Artifacts

| ART-ID | Cycle | REQ-ID | Path / Description | Status |
|--------|-------|--------|-------------------|--------|
| — | — | — | — | — |

## Build Notes

- Artifacts are registered here when Stage 3 (Synthesis) produces or modifies code/docs.
- Version suffix: `ART-0001.N` on rebuild within a cycle (see agile-v-lifecycle).

## Verification Commands (project default)

```bash
npm test
npx tsc --noEmit
npm run lint
```

Optional for release candidates:

```bash
npm run build
```
