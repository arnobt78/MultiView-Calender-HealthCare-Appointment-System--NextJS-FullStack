# Cycle C7 — Services catalog + appointment cancel + reminders + patient phone

<!-- Active living cycle — archive on Human Gate 2 (GATE-0014) -->

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0034..REQ-0037 |
| **ART-IDs** | ART-0169..ART-0192 |
| **Bootstrap** | 2026-06-08 |
| **Commits** | `dcd4374`, `e73a7d0` |
| **Gate 1** | GATE-0013 (pending) |
| **Gate 2** | GATE-0014 (pending) |
| **Tests** | **829**/829 Vitest (158 files) |

## Scope

| REQ | Theme |
|-----|-------|
| REQ-0034 | Services catalog brand icons/colors + type filter |
| REQ-0035 | Appointment `cancelled` status + RBAC + notify + status badge UI |
| REQ-0036 | Reminder cron + `reminder_sent_at` + optional Brevo SMS |
| REQ-0037 | Patient `phone` CRUD + validation + list/search + SMS fallback |

## Notes

- Brevo SMS opt-in (`BREVO_SMS_API_KEY`); email/in-app reminders work without SMS credits.
