# Cycle C6 — Invoice violet + visit location parity

<!-- Active living cycle — archive on Human Gate 2 (GATE-0012) -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0027..REQ-0033 (incl. 0032 patient UX, 0033 ID copy) |
| **ART-IDs** | ART-0126..ART-0155 |
| **Bootstrap** | 2026-06-05 |
| **Commits** | `29fd3b5`, `cad0b07`, `636282e`, `bcfe6d4`, `a31bf78`, `84967f6`, `629c3ed` |
| **Gate 1** | GATE-0011 (pending) |
| **Gate 2** | GATE-0012 (pending) |
| **Tests** | **772**/772 Vitest (145 files) |

## Scope

| REQ | Theme |
|-----|-------|
| REQ-0027 | Visit fee badges — per-surface height parity |
| REQ-0028 | Invoice violet UI + detail header Generate/Download + PDF route |
| REQ-0029 | Invoice dialog violet + footer Send dedupe + CP patient chrome |
| REQ-0030 | Visit location resolver — portal, booking, cards, detail |
| REQ-0031 | Location fallback — doctor portal, dashboard queue, patient snapshot table |

## Out of scope (documented)

Native `.pdf` binary — HTML print attachment accepted (`REQ-0031` note).
