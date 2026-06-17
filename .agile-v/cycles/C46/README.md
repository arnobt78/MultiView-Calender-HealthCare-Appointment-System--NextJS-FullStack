# Cycle C46 — Portal patient invoice shell + snapshot slimming

| Field | Value |
|-------|-------|
| **REQ-IDs** | REQ-0097 |
| **Bootstrap** | 2026-06-17 |
| **Parent** | REQ-0096 (C45) |

## Scope

- Portal `/patients/*` layout — `ClinicianInvoiceDialogShell` + SSR invoice prefetch (parity with `/appointments/*`)
- Dedupe `prefetchInvoices` on patient detail pages (layout owns warm cache)
- Slim `loadPatientSnapshotData` — count-only invoices, empty `invoices[]` payload

## Key paths

`patients/layout.tsx` · `PatientsClinicianLayoutClient.tsx` · `patient-snapshot-data.ts` · `PatientDetailScreen.tsx`
