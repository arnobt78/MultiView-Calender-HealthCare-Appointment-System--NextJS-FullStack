# Cycle C44 — Appointment dialog parity

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0095 |
| **Bootstrap** | 2026-06-17 |
| **Parent** | REQ-0094 (C43) |
| **Gate 1/2** | TBD |

## Scope

- `enrichFullAppointmentDialogSeeds` — calendar/list edit instant physician + visit type labels
- `AppointmentStatusSelect` — dashboard filter icon/color parity; create disables Cancelled
- `SchedulingSlotChipGrid` — past slot chip highlighted read-only on edit

## Key paths

`appointment-detail-dialog.ts` · `AppointmentStatusSelect.tsx` · `AppointmentDialog.tsx` · `SchedulingSlotChipGrid.tsx` · `filter-select-option-presets.ts`
