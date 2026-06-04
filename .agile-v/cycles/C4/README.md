# Cycle C4 — Invoice dialog, detail live, RBAC, calendar badges (planned)

<!-- Scaffold only — activate after C3 Gate 2 archive -->

| Field | Value |
|-------|-------|
| **Status** | `planned` |
| **REQ-IDs** | REQ-0016..REQ-0020 (`new [C4]` in living REQUIREMENTS.md) |
| **Gate 1** | GATE-0007 (not opened) |
| **Gate 2** | GATE-0008 (not opened) |
| **Depends on** | C3 closed → archive `cycles/C3/` |

## Planned scope (from product baseline 2026-06-02)

| REQ-ID | Theme |
|--------|-------|
| REQ-0016 | Amber glass `InvoiceFormDialog` (create/edit), visit picker, `StaffInvoiceDialogShell` on staff layouts |
| REQ-0017 | Invoice detail live body + `GET /api/invoices/[id]` prefetch + payments `visit_summary` |
| REQ-0018 | Doctor invoice edit RBAC (own draft/sent/overdue → description/due_date PATCH) |
| REQ-0019 | Calendar day/week/month/list hover invoice badge via `useAppointmentInvoiceDisplayMap` |
| REQ-0020 | SSE notification stream safe enqueue + route abort (no heartbeat spam) |

## Entry

1. Human approves C3 GATE-0005/0006 → freeze `cycles/C3/`.
2. Set `STATE.md` → C4, Stage 1 Specify.
3. Move REQ-0016..0020 from `new [C4]` → `approved [C4]` at Gate 1.
