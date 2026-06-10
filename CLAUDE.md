# CLAUDE.md

Agent guide. Narrative: `docs/PROJECT_WALKTHROUGH.md`.

## Latest (2026-06-10)

- **C12.3 CP refresh + chrome runtime:** sync store register no emit; `notifyControlPanelChromeRegistry` in layout effect; cleanup `[tab]` only (fixes stale subtitle + dead Refresh); `pageHeaderRootClass` transparent blur.
- **Overview/notifications:** dynamic subtitle (`dashboard-overview-subtitle`, `notifications-subtitle`); `showMetricSlot`; Refresh → `runCpSectionRefresh` + Sonner; SSR `updatedAt` seed/prefetch.
- **C12.2:** slim context; SSR snapshot = live; description fragment; AdminUserDetail subtitle.
- **C12.1:** tab-scoped sync store; unmount guard; Export CSV literal.
- **Invalidation:** unchanged — notifications CRUD → `invalidateNotificationsAndCrossTab`.
- **Verify:** **908/908** · tsc · lint · build PASS.
## Never / Always

**Never:** hardcode query keys; skip invalidation; `<a href>` internal; shadcn Checkbox; `user` on `UserAvatar`; extra impl `.md`.

**Always:** `queryKeys` + invalidation helpers; `getSessionUser()`; `dynamic = "force-dynamic"` APIs; `rbac.ts`; `Link` internal.

## Invalidation

| Write | Helper |
|-------|--------|
| Appointment | `invalidateAfterAppointmentMutation` |
| Patient | `invalidateEntityAffectingAppointments` + `invalidatePatientDetailAndSnapshot` |
| Invoice | `invalidateInvoicesAndOverview` / `invalidateInvoicesBilling` |
| Types/config | `invalidateAppointmentTypeDerived` |

Cross-tab: `query-cache-cross-tab.ts`.

## Key paths

- Page chrome: `control-panel-chrome-sync-store.ts`, `ControlPanelChromeActions.tsx`, `control-panel-refresh-notify.ts`, `dashboard-overview-subtitle.ts`, `notifications-subtitle.ts`, `page-chrome-classes.ts`
- Phone: `phone-validation.ts`, `patient-form-clinical.ts`, `PatientFormDialog`, `reminder-recipient-phone.ts`
- Cancel: `appointment-cancel-access.ts`, `appointment-id-write.ts`, `appointment-notify.ts`, `AppointmentActionsMenu`
- Status UI: `appointment-status-display.ts`, `AppointmentStatusGlassBadge`
- Cron SMS: `brevo-sms.ts`, `cron/reminders/route.ts`
- DP billing: `DoctorPortalInvoiceListRow`, `InvoiceStatusCountInlineRow`, `invoice-list-meta-status-dates.ts`
- Invoice: `InvoiceDetailLiveBody`, `invoice-dialog/`

## Agile V

Infinity Loop every prompt: `.agile-v/ACTIVATION.md` · `STATE.md` · `SKILLS.md` (24). **C12.2** shipped (REQ-0055..0057); runtime refresh polish un-REQ'd.

## Principle

Minimal typed diffs; shared libs; SSR seed + invalidate on every CRUD.
