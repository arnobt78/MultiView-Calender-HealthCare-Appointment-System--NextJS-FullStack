# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-11)

- **C18/C18.1 (REQ-0064/0065):** Org CP indigo shell; enriched list API (`organization-list-enrich.ts`); stats/filters/DataTable; `InvoicePortalListCard`; compact list billing (top 3, cap 20) + full detail billing; glass dialogs; `loadOrganizationDetailForUser` + detail/members seed; hover prefetch; `invalidateOrganizationDetail` cross-tab.
- **C17.1:** dialog back tokens `cursor-pointer`; removed redundant `cursor-pointer` on glass call sites.
- **Verify:** **954/954** · tsc · lint · build PASS.

## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` (+ `getOrganizationIdFromInvoiceCache`) |
| Organization | `invalidateOrganizations` / `invalidateOrganizationDetail` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts` (`ORGANIZATIONS`, `INVOICES_BILLING` on org detail).

## Key paths

- **Org CP:** `OrganizationManagement.tsx`, `organization-management-columns.tsx`, `OrganizationBillingPanelCompact`/`Full`, `organization-detail-load.ts`, `organization-dialog/`
- Entity detail: `EntityDetailPageShell.tsx`, `EntityDetailBackLink.tsx`, `EntityDetailFooterRow.tsx`
- **CP lists:** shared `cpClinicalListTableFrameClassName` + actions shell; tone per tab (`sky`/`violet`/`indigo`/`emerald`)
- Admin user: `admin-user-detail-ui-classes.ts`, `EntityEmailVerificationBadge.tsx`, `violet-glass-table-frame.ts`
- Glass: `calendar-header-action-styles.ts`, `ControlPanelGlassActionButton.tsx`
- Invoice: `InvoicePortalListCard.tsx`, `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

`.agile-v/ACTIVATION.md` · `STATE.md` · **C18.1 shipped** (REQ-0064/0065).

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
