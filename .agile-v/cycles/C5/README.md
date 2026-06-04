# Cycle C5 — Entity detail Record Audit + user audit FKs

<!-- Active living cycle — archive on Human Gate 2 (GATE-0010) -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0021..REQ-0026 |
| **ART-IDs** | ART-0101..ART-0125 |
| **Bootstrap** | 2026-06-04 (retroactive traceability) |
| **Commits** | `9785c8d`, `d826ca7` |
| **Gate 1** | GATE-0009 (pending) |
| **Gate 2** | GATE-0010 (pending) |
| **Tests** | 742/742 Vitest (138 files) |

## Scope

| REQ | Theme |
|-----|-------|
| REQ-0021 | Shared Record Audit UI — `EntityDetailRecordAuditCard`, `EntityDetailAuditActorInline`, mappers |
| REQ-0022 | DB audit FKs — migrations `013`–`015`, Prisma includes, serializers |
| REQ-0023 | Appointment detail — invoice issued rows, live subtitle, visit overview |
| REQ-0024 | CP admin user detail Record Audit (`AdminUserDetailScreen`, `userDetailInclude`) |
| REQ-0025 | `db:backfill-user-audit` + seed-test-user audit stamp |
| REQ-0026 | List APIs omit audit joins (performance constraint — document only) |

## Tomorrow start

1. Human approve **GATE-0005/0006** (C3) and **GATE-0007/0008** (C4) if closing archives.
2. Human approve **GATE-0009/0010** (C5) → freeze `cycles/C5/`.
3. Optional: portal `/admins/[id]` Record Audit (no REQ yet — create REQ-0027 if scoped).
4. Verify C4 **REQ-0018..0020** on main if not yet in VALIDATION_SUMMARY.

## Intentional gap

Portal `/admins/[id]` — read-only admin profile without Record Audit block.
