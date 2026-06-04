# Cycle C4 — Invoice dialog, detail live, RBAC, calendar badges (planned)

<!-- Scaffold only — activate after C3 Gate 2 archive -->

| Field | Value |
|-------|-------|
| **Status** | `shipped` — gates pending |
| **REQ-IDs** | REQ-0016..REQ-0020 (`approved [C4]`) |
| **ART-IDs** | ART-0086..0100 |
| **Gate 1** | GATE-0007 (pending) |
| **Gate 2** | GATE-0008 (pending) |
| **Depends on** | C3 archive optional before C4 freeze |

## Planned scope (from product baseline 2026-06-02)

| REQ-ID | Theme |
|--------|-------|
| REQ-0016 | Amber glass `InvoiceFormDialog` (create/edit), visit picker, `StaffInvoiceDialogShell` on staff layouts |
| REQ-0017 | Invoice detail live body + `GET /api/invoices/[id]` prefetch + payments `visit_summary` |
| REQ-0018 | Doctor invoice edit RBAC (own draft/sent/overdue → description/due_date PATCH) |
| REQ-0019 | Calendar day/week/month/list hover invoice badge via `useAppointmentInvoiceDisplayMap` |
| REQ-0020 | SSE notification stream safe enqueue + route abort (no heartbeat spam) |

## Verify

671+ tests at UI tranche; superseded by C5 baseline **742**. ER-C4-UI-VERIFY.

## Archive

Approve GATE-0007/0008 → copy living snapshot → `cycles/C4/` (immutable).
