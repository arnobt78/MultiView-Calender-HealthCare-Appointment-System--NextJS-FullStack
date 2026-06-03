# HealthCal Pro — Project Walkthrough

## Latest (2026-06-02 — Invoice dialog + preset create + SSE)

- **InvoiceFormDialog:** amber glass 90vw shell; create (picker/preset) + edit (description/due date); `invoice-dialog-ui-classes.ts`, rich `InvoiceVisitPickerCard` / `InvoiceVisitSummaryCard`; enriched `billing-appointment-options-load` + SSR seed `queryKeys.billing.appointmentOptions`.
- **Shared dialog:** `StaffInvoiceDialogShell` → `InvoiceFormDialogProvider` on CP, dashboard (`HomePage`), doctor portal, `/appointments`, `/invoices` layouts. Lists use `useInvoiceFormDialog()`; cards use `useInvoiceFormDialogOptional()` + **Create invoice** in `AppointmentActionsMenu`.
- **Preset create:** `openCreateForAppointment(id)` from calendar ⋮ or `AppointmentDetailBillingActions`; `useBillingAppointmentOptionById` + amount prefill via `invoice-form-guards.ts`.
- **Detail live edit:** `InvoiceDetailLiveBody` subscribes `useInvoice`; `InvoiceDetailClient` **Edit details**; `hideViewLink` on detail; doctor mutate on sent/overdue own invoices.
- **API parity:** `GET /api/invoices/[id]`, `GET /api/payments`, `prefetchInvoiceDetail` attach `visit_summary`.
- **SSE hardening:** `createSafeSseEnqueue`; poll error → single error event + stop (no `ERR_INVALID_STATE` heartbeat spam).
- **Calendar invoice badge:** List/Day/Week/Month + hover popover via `useAppointmentInvoiceDisplayMap` (`invoices.all` cache).
- **Verify:** Vitest **666** (120 files), tsc, lint, build.

## Prior (2026-06-02 — Portal UI + Staff scope + Confirm dialogs)

- **Staff calendar scope:** `staff-appointment-calendar-scope.ts` — `staffCalendarVisibilityOrClauses`: owner **OR** treating **OR** accepted assignee (`user_id` / `invited_email`). Same filter on `GET /api/appointments`, `?ids=` batch, **`GET /api/calendar/export`**, **`POST /api/calendar/sync`**, **`GET /api/appointments/search`**, doctor-portal API, login-today count, non-admin dashboard overview. SSR: `prefetchDashboardAppointments`, `prefetchDoctorPortal`, `prefetchDashboardOverview(userId, role, email)` via `control-panel-section-prefetch`.
- **Doctor portal:** stacked panel headers (billing/patients); invoice rows (`DoctorPortalInvoiceListRow`, `invoice-list-display`); SSR visit summaries on invoices.
- **Confirm dialogs:** `ConfirmActionDialog` + `confirm-delete-dialog-copy.tsx` — destructive/warning actions portal + CP + calendar/settings; dropdown deletes: dialog as menu **sibling**.
- **Org billing KPI:** `invoice-billing-totals.ts`, `GET /api/invoices/billing-totals`, dual query keys + `prefetchOrgBillingInvoicesByOrgIds`.
- **Invoice revenue KPI grid:** `InvoiceRevenueKpiGrid` — amount + count badge + insights period hint; `formatBillingKpiMoney` (exact EUR). Used on `/insights`, CP invoice-management, org billing. API `billing-totals` returns `{ totals, statusTotals }`; insights `fetchRevenueAggregates` adds `statusTotals` + `paidInPeriodCount`.
- **Insights KPI:** View-as hints (`formatInsightsPeriodStatValueLabel`); **Telehealth %** = `fetchTelehealthShareForPeriod` (same `start` window as pending/avg duration). Top-row Today/week/month/YTD = fixed calendar only.
- **Verify:** Vitest **638** (114 files), tsc, lint, build.

## Prior (2026-06-02 — Appointment Type Pricing + Doctor Profiles + CP UI)

- **DB:** `012_appointment_type_price_cents.sql` — `price_cents INT DEFAULT 0` on `appointment_types`. Seed (`db:seed-extended`) sets prices on all 4 global types (Initial €150, Follow-up €92.50, Telehealth €85, Annual €120) + full doctor profiles (bio, specialty, phone, license, department, office, fee, experience, languages).
- **Price threading:** `appointment_type_price_cents` flows from every Prisma query site through `serializeAppointment` to `Appointment` type. Covered: main GET/POST/PATCH/PUT, batch `?ids=`, PATCH `[id]`, patient-portal GET+POST, admin-portal, doctor-portal, all SSR prefetch paths, snapshot rows. `PortalAppointmentIncludeRow` extended. `appointmentSnapshotInclude` includes `price_cents`.
- **Booking UI:** `VisitTypePickerList` + `VisitTypeSummaryCard` show emerald price badge. Draft disclaimer note. Works in patient booking wizard and staff dialog (shared component). `DoctorDirectoryAppointmentType`, `DoctorBookableTypeRow`, `AppointmentTypeDoctorApiRow` all carry `price_cents`. `mapApiBookableToPatientBookingType` + `mapDirectoryBookableToPatientBookingType` pass price through.
- **Appointment card:** `appointmentTypePriceCents` prop → "Visit fee: €X.XX · est." badge. Wired in `AppointmentList`, `MonthView`, `AppointmentHoverCard`. `InvoiceStatusBadge` already present.
- **Auto-draft:** `billing-auto-draft.ts` uses `resolveVisitFeeCents` (`billing-visit-fee.ts`) — type price first, doctor `consultation_fee` fallback. `notifyPatientDraftInvoiceCreated` (`billing-notify.ts`) emails patient on invoice creation.
- **Appointment Types page:** `GlobalAppointmentTypesEditor` rewritten — stats row (4 `PatientStatCard`), Global A-Z section, Custom by Doctor A-Z section, 3-field forms (Name/Duration/Price). `GET /api/appointment-types/admin-all` (admin-only). Page title "Appointment Types" via `APPOINTMENT_TYPE_COPY`.
- **Doctor profiles:** `StaffDirectoryEntry` extended with all profile fields. `DoctorDetailScreen` shows phone/license/department/office/fee/experience/languages. `PatientDetailScreen` doctor card shows all extended fields. `buildStaffDirectoryMap` merges new fields.
- **CP consistency:** `InvoiceManagement` + `AppointmentsManagement` + `OrganizationManagement` — `PageHeader` added. Invoice: Draft stat card (`PatientStatCard` amber). Org: 2-tile stats row. UserManagement already had PageHeader+stats.
- **Portal compact rows:** Emerald price badge (`€X.XX · est.` + Euro icon) added to `PortalAppointmentTimelineCard` (patient portal timeline), `DoctorPortalAppointmentListRow` (doctor portal today/upcoming panels), `RecentAppointmentRow` inline in `AdminPortalPage`. Data already flowed via `serializeAppointment`; only UI rendering was missing. `billing-notify-patient.ts` = draft invoice email (separate from `billing-notify.ts` which handles paid/failed/refunded events).
- **Tests:** 600 / 106 files. tsc 0 errors. lint clean. build ✓.

## Previous Audit (2026-06-02)

- **Invoice billing KPI + org list:** `invoice-billing-totals.ts` — `INVOICE_OUTSTANDING_STATUSES` shared by UI and server aggregates. `fetchInvoiceBillingTotalsForOrganization` now actively powers org KPI cards through new API `GET /api/invoices/billing-totals?organizationId=`. Query keys: `queryKeys.invoices.byOrganization(orgId)` + `queryKeys.invoices.byOrganizationTotals(orgId)`. **Org SSR:** `prefetchOrgBillingInvoicesByOrgIds` seeds both list + totals for every org on CP organizations tab (cap 20). **Organization billing:** all org panels render (removed `slice(0,3)`), all invoices shown, `InvoiceBillingStatsRow` + `InvoiceBillingListRow`. Invalidation: `invalidateInvoices*` → `invoices.all` prefix includes both org list + totals keys.
- **Entity detail empty values:** `ClinicalEmptyDash` — single em-dash; `clinicalEmptyOr` / `clinicalEmptyOrNode` on patient, doctor, category CP detail schema rows (`patient-care-level.ts` `hasPatientCareLevel`).
- **Dashboard calendar filters:** `CategoryFilterSelect` + `PatientFilterSelect` (brand mark / portrait + age + care tier); `ClinicalListFilterToolbar` reset right-aligned. **Clinical role** filter (`calendar-clinical-role-filter.ts`): default **All My Visits**; **Created by Me**; **Referred to Me (Treating)** — client-side on staff views; hidden for patients.
- **Staff calendar scope:** owner **OR** treating **OR** accepted assignee — see Latest section. **Admin** overview KPIs stay org-wide via `dashboardOverviewAppointmentFilter`.
- **Curated demo seed:** `npm run db:seed-demo-appointments` → `scripts/seed-demo-appointments-curated.ts` (exactly **10** rows, marker `seed-demo-curated:v1`, invoice matrix). Bulk timeline: `db:seed-demo-appointments-timeline`. Full reset: `CONFIRM_DB_CLEAR=YES npm run db:clear` → `db:prepare` → `db:seed-extended` → `db:seed-demo-appointments` → `db:migrate`.
- **Cross-portal revenue fix:** Admin **Dashboard Overview** revenue now uses `fetchRevenueOverviewForViewer` (global totals — same universe as CP Invoice Management). Doctor Management **Revenue** column attributes paid cents to treating physician, then calendar owner (`fetchPaidRevenueCentsByDoctorIds`). Invoice writes bust all admin overview Redis keys (`invalidateAdminDashboardOverviewCaches`).
- **Billing owner:** `resolveInvoiceBillingUserId` prefers `treating_physician_id` over `owner_id` on create.
- **Visit context on invoices:** `InvoiceLinkedVisitPanel` on `/invoices/[id]` and CP invoice detail; `visit_summary` on list APIs + patient/doctor portal cards + CP invoice table; snapshot invoices include visit line under description.
- **Invoice status on appointments:** Dashboard list cards show **Invoice:** badge when `invoices.all` cache has a linked row (`useAppointmentInvoiceDisplayMap`).
- **Auto-draft on done:** `maybeCreateDraftInvoiceForCompletedVisit` on appointment PATCH when status becomes `done` (requires doctor `consultation_fee` > 0).
- **Org panel:** `010_backfill_invoice_org_and_billing.sql` tags invoices when billing doctor has one org; demo seed adds all doctors to HealthCal Demo Clinic; org tab SSR-seeds first org billing list; UI shows full list + KPI strip (see invoice billing KPI bullet above).
- **One bill per visit / picker / Refunded badge:** `billing-appointment-eligibility.ts`, POST **409**, `009` migration, shared picker + SSR seed (unchanged contract).
- **Payments:** `011_payment_stripe_id_unique.sql`; payment history UI dedupes duplicate Stripe IDs.
- **Tests:** Vitest **589** (102 files), incl. `invoice-billing-totals.test.ts`, `org-billing-prefetch.test.ts`, `clinical-empty-dash.test.tsx`, `control-panel-section-prefetch.test.ts`. **DB:** `npm run db:migrate` (silent OK) runs `009`–`011`.
- **Staff calendar scope:** unified owner/treating/assignee — see Latest (2026-06-02).

## Prior (2026-05-31)

- **Agile V AQMS:** `.agile-v/` — `SKILLS.md`, `BOOTSTRAP.md`, phases `01`–`05`. C1/C2 archived; `STATE.md` → C3.

## Prior (2026-05-30)

- **Doctor assigned-patients live roster:** `GET /api/doctors/[id]/assigned-patients` + `queryKeys.doctors.assignedPatients(id)` + `useDoctorAssignedPatients`; SSR seed on CP doctor detail; `invalidateDoctorAssignedPatients` + `doctors.all` on patient CRUD (count + roster refresh without navigation).
- **CP user detail parity:** `/control-panel/users/[id]` — doctors redirect to `/control-panel/doctors/[id]`; admin/staff use `AdminUserDetailScreen` + `AdminUserFormDialog`. Legacy `DoctorDetailForm` deprecated, unwired.
- **Doctor management (CP):** stats, `ClinicalListFilterToolbar`, emerald table; merge `useUsers` + `useDoctorsDirectory()`; revenue via `paid_revenue_cents`; inactive UX on `/services`/booking.
- **Verify:** `npm test` **520**, `tsc`, `lint`, `build` green.

## Prior (2026-05-30 — doctor list UI)

- **Doctor detail:** `/control-panel/doctors/[id]` → `DoctorDetailScreen` (schedule editors, assigned patients, deactivate); edit via `DoctorFormDialog`.
- **`User.is_active`:** migration `008_user_doctor_active_status.sql`; booking API guards; inactive doctors on `/services` with badge, no book button.
- **Shared filter toolbar:** `ClinicalListFilterToolbar` — Reset right-aligned (`ml-auto`).
- **Doctor revenue column:** `doctor-revenue-aggregate.ts`; invalidates via `invalidateInvoicesAndOverview` + `invalidateUsersAndAuth`.
- **List API parity:** `USER_API_SELECT`.

## Prior (2026-05-31)

- **Dynamic navbar / header offset:** `useAppNavbarHeightSync` → `--app-navbar-height`; `.app-main-offset` in `globals.css` on `AuthShell` `<main>` (literal CSS class, not Tailwind arbitrary in TS). Admin nav nowrap via `navbar-ui-classes.ts`.
- **Shared category detail:** `CategoryDetailScreenShared` — CP wrapper sky + CRUD (`ControlPanelCategoryDetailScreen`); portal `/categories/[id]` amber glass (`CategoryDetailScreen` read-only). Tokens: `category-detail-ui-classes.ts`, `amberGlassBackButtonClass`.
- **Snapshot mapper:** `appointment-snapshot-row.ts` + `appointmentSnapshotInclude` — patient + category snapshot/API/prefetch share one projection (patient denormalized fields, doctor images).
- **Category audit trail:** `migrations/007_category_audit_users.sql` — `categories.created_by` / `updated_by`; Prisma relations; POST/PUT set actor; GET + `prefetchCategory` include `categoryDetailInclude`; `EntityDetailRecordAuditCard` + role-aware `EntityDetailAuditStaffLink`.
- **Prefetch:** CP + portal category pages SSR `prefetchUsersList` (doctor/admin); hover `prefetchCategoryDetailStaffUsers` in `prefetch-route-queries.ts`.
- **Verify:** `npm test && npx tsc --noEmit && npm run lint && npm run build` — **503 tests**. Local DB: `npm run db:migrate` (007) then `npm run prisma:push`.

## Prior (2026-05-30)

- **App-wide section layout:** `src/lib/section-page-layout.ts` — `appSectionRootClass` (CP + scroll panes with `pb-3`), `appPortalSectionRootClass` (portals/insights inside `dashboardShellClass`), `appEntityDetailRootClass` (`space-y-3 pb-24`), `resolveAppSectionRootClass`, `appSectionErrorBannerClass`. CP consumers re-export via `control-panel-section-layout.ts`.
- **Shared error banner:** `AppSectionErrorBanner` — Telehealth, DashboardOverview, PatientManagement, Notifications, InvitationList, Services, PatientDetailView.
- **Portal + insights roots:** `ServicesPage`, `PatientPortalPage`, `DoctorPortalPage`, `AdminPortalPage`, `AnalyticsPage` → `appPortalSectionRootClass`.
- **Entity detail roots:** CP `CategoryDetailScreen` → `appEntityDetailRootClass`; portal `CategoryDetailScreen` + `AppointmentDetailScreen` → shell-aware tokens; `PatientDetailScreen` `scrollShell` prop (`control-panel` vs `portal`); CP `/control-panel/users/[id]` → `appSectionRootClass`.
- **Doctor-portal roster:** `PatientManagementInner` `resolveAppSectionRootClass("portal")` when embedded — no double bottom padding.
- **CP list-tab layout parity:** All 14 tabs on `controlPanelSectionRootClass`; Google Calendar full width.
- **CP SSR prefetch + notification SSE:** unchanged — `prefetchControlPanelSection`, `useNotificationStream`, `invalidateNotificationsAndCrossTab`.
- **Doctor detail layout:** `/doctors/[id]` → `appPortalSectionRootClass`; `/control-panel/doctors/[id]` → `appSectionRootClass` + `force-dynamic`.
- **CP list errors:** Doctor/Category/User mgmt → `AppSectionErrorBanner`.
- **Services `/services` cards:** `DoctorAvailabilityGroups` `layout="services-card"` — days with identical hours merge to one row (day badges + time); split hours on one weekday stay on one row as separate inline time chips.
- **Skipped (intentional):** Form/dialog/card inner `space-y-2`; grid `gap-4/5/6`.
- **Verify:** `npm test && npx tsc --noEmit && npm run lint && npm run build` — **503 tests**.

## Prior (2026-05-30 — app section layout)

- **Dashboard `/dashboard` SSR:** `force-dynamic` page prefetches categories, patients, assignees, accepted dashboard-access, and merged calendar list (`src/lib/appointments-list-build.ts` + `prefetchDashboardAppointments` in `server-prefetch.ts`). `HomePage` seeds TanStack cache before paint — no calendar flash on hard refresh.
- **Calendar fetch contract:** Owned rows capped at `PAGINATION.CALENDAR_APPOINTMENTS_LIMIT` (100 demo); invited/shared rows resolved by `resolveExtraAssignedAppointmentIds` and fetched in one batch (`GET /api/appointments?ids=` / `fetchAppointmentsByIds`).
- **Control panel SSR:** `organization-management` section prefetches orgs; `control-panel/layout.tsx` prefetches `CP_DOCTOR_USERS_FILTERS` + `CP_ALL_USERS_FILTERS` once for all CP routes via `ControlPanelSsrCacheSeed`.
- **Cross-tab:** `invalidateOrganizations` publishes `CROSS_TAB_SCOPES.ORGANIZATIONS`.
- **Skipped (intentional):** SPA client-nav seed; appointment-types prefetch everywhere; bulk-import snapshot bust.

## Prior (2026-05-28)

- Appointment card variant parity hardening completed:
  - `list` keeps inline identity rows for full-width dashboard cards.
  - `month-panel` + `popover` keep stacked identity rows (label line + avatar/name/email block).
- Patient demographic badge rollout in appointment cards:
  - Reuses shared `PatientAgeGlassBadge` and a new shared `PatientCareTierGlassBadge`.
  - `list` renders age + care tier badges inline on the Client row (wraps when narrow).
  - `month-panel` + `popover` render demographics on a second line under Client name/email (same pattern as doctor specialty).
- Doctor identity parity update:
  - Stacked rows now render `DoctorSpecialtyBadge` (owner/treating/primary).
  - Identity email rendering normalized to bracket format `(email)` across list + stacked variants.
- Data contract parity for identity metadata:
  - `specialty` now flows through patient-facing appointment includes, serializers, prefetch, and owner summary hook.
- Added component UI coverage for `AppointmentCard` variant contract + identity specialty/email rendering.
- Insights chart no-flash loading rollout is complete.
- Chart wrappers no longer swap plot area to generic loading skeletons.
- `AnalyticsChartPlotShell` now provides shared in-plot loading pulse overlay while keeping chart layout mounted.
- Pie loading preserves neutral frame behavior (no misleading fake slice data).
- Contract audit confirmed no changes in `query-keys`, `query-client` invalidation matrix, or insights SSR prefetch flow.
- Validation audit passed: tests, TypeScript, lint, and production build all green.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Prisma (PostgreSQL), TanStack Query v5, Framer Motion, Shadcn/UI, Radix UI, Sonner (toasts), Zustand, jose (edge JWT), bcryptjs, Vercel Blob, Stripe, Resend.

### Role-based entity detail routing

- **Href map:** `src/lib/entity-routes.ts` — `appointmentDetailHref`, `patientDetailHref`, `categoryDetailHref`, `doctorDetailHref`.
- **Access (appointments):** `src/lib/appointment-access.ts` — `resolveAppointmentAccess` (`none` | `view` | `mutate`). Used by `GET|PUT|PATCH|DELETE /api/appointments/[id]` and SSR detail pages.
- **Access (patients):** `src/lib/patient-access.ts` — `resolvePatientAccess` (`none` | `view` | `mutate`). Admin mutate all; doctor mutate **only** when `primary_doctor_id === viewer`; doctor view when related or roster browse (`?fromDoctor=` from `/doctors/[id]`); patient view own email only. `canViewPatientDetail` → `resolvePatientAccess !== "none"`.
- **Access (doctor profile):** `src/lib/doctor-access.ts` — `canViewDoctorPortalProfile` for `/doctors/[id]` directory browse.
- **Routes:** Admin stays on `/control-panel/*`. Doctors/patients use `/appointments/[id]`, `/patients/[id]`, `/categories/[id]`, `/doctors/[id]` with thin layouts (no CP sidebar). `control-panel/layout.tsx` redirects non-admins away.
- **Href helpers:** `patientDetailHrefWithContext(role, id, fromDoctorId?)` for roster-aware patient links.
- **UI:** `AppointmentDetailScreen`, **`CategoryDetailScreenShared`** (portal amber / CP sky via wrappers), `PatientDetailScreen` (required `accessLevel`); `RoleEntityLink` on client surfaces; `PrefetchingLink` + `prefetchQueriesForDetailHref` (category detail + snapshot + **`prefetchCategoryDetailStaffUsers`** on hover); `BackNavigationLink` on detail backs (click → `invalidateQueriesForRoute` then navigate).
- **API patient gates:** `GET /api/patients/[id]` + snapshot require view+; `PUT`/`DELETE` require mutate; optional `?fromDoctor=` on GET (see `patient-api-access.ts`).
- **Invalidation:** mutation helpers unchanged; add `invalidateQueriesForRoute` for back-navigation list refresh without `refetchOnMount`.
- **Links wired:** calendar (`AppointmentList`, `DayView`, `WeekView`/`MonthView` via `AppointmentHoverCard`), portals, global search, notification deep links (create/booking/cron).
- **Verify:** `npm test && npx tsc --noEmit && npm run lint && npm run build`.

### Role-based billing (invoices + Stripe)

| Role | List | Detail | Pay / mutate |
|------|------|--------|----------------|
| Admin | CP Invoice Management | `/control-panel/invoices/[id]` | full + refund |
| Doctor | `GET /api/invoices` (scoped) | `/invoices/[id]` | draft mutate on own |
| Patient | patient portal + `/api/invoices` | `/invoices/[id]` | Stripe pay when `pay` |

- **Shared UI:** `src/components/shared/billing/*` — `CreateInvoiceDialog`, `InvoiceAppointmentPickerField`, `InvoiceVisitPickerList`, `InvoiceStatusBadge`, `InvoiceDetailClient`, `InvoicePayActions`, `InvoiceAdminActionsMenu`.
- **Libs:** `invoice-billing-totals.ts`, `billing-appointment-eligibility.ts`, `billing-appointment-options-load.ts`, `invoices-revenue-scope.ts`, `invoice-visit-summary.ts`, `billing-auto-draft.ts`, `billing-dashboard-cache.ts`.
- **Doctor portal:** `DoctorPortalInvoicesCard` + SSR `prefetchInvoices` + `prefetchBillingAppointmentOptions` on `doctor-portal/page.tsx`.
- **CP invoices tab:** SSR `prefetchInvoices` + `prefetchBillingAppointmentOptions` via `prefetchControlPanelSection("invoices")`.
- **Org billing:** `OrganizationBillingPanel` — `?organizationId=` filter; `InvoiceBillingStatsRow` + `InvoiceBillingListRow`; all rows (no cap); member view / admin tag on create.
- **Env:** see `.env.example` — `STRIPE_*`, `NEXT_PUBLIC_APP_URL`. Local webhook secret from CLI; production secret from Stripe Dashboard endpoint only.

### Doctor display + `/services`

- **Route:** `/services` — `src/app/services/page.tsx` SSR-prefetches doctors + global types; client `ServicesPage.tsx`.
- **API:** `GET /api/doctors` → specialty, bio, image, `is_active`, `doctor_availabilities`, `bookable_appointment_types`, `patient_count`, `paid_revenue_cents` (`queryKeys.doctors.all`).
- **Provider:** `DoctorDisplayProvider` (`src/context/DoctorDisplayContext.tsx`) in `AppProviders` — specialty glass classes + robohash helper (no extra network).
- **Components:** `src/components/shared/doctor-display/*` — badges, avatars, `DoctorIdentityRow`, `DoctorLinkStack`, `DoctorCardHeroImage`, availability groups; **`ServicesDoctorFilters`** (search + **`ServicesCatalogTypeSelect`** visit-type filter + specialty/weekday/date); **`filterDoctorsByServiceCatalog`** (`src/lib/services-doctor-catalog-filter.ts`) matches `bookable_appointment_types` on each doctor row. **Appointment Services** block shows full catalog (no duplicate filter there).
- **Layout:** specialty badge always on its own line below name/email (`showIcon` default true). `/services` hero uses full-bleed cover with blurred backdrop fill (uniform tiles, face-biased crop); badge is in the card body under email, not on the image.
- **Card UX:** flush hero image, `RoleEntityLink` doctor name, copy-email, `EntityActiveStatusBadge`, grouped availability rows; book CTA only when `isDoctorActive` — else “Inactive — booking unavailable”. Date filter matches calendar chrome (left calendar icon, `pl-8`, `min-w-[155px]`).
- **Global reuse:** CP patient list/detail primary doctor + snapshot tables (`DoctorIdentityRow` / `DoctorIdentityCell`); Doctor Management stacks specialty + status in Doctor column; revenue column sortable.
- **Invalidation:** doctor PATCH / deactivate / availability → `invalidateUsersAndAuth` / `invalidateDoctorSchedule`; invoice CRUD → `invalidateInvoicesAndOverview` — both bust `doctors.all`.

### Patient booking dialog (`PatientBookingDialog`)

- **Location:** `src/components/shared/patient-booking/` — shell `PatientBookingDialog.tsx`; sections `PatientBookingDoctorTypeSection`, `PatientBookingScheduleSection`, `PatientBookingConfirmSection`; `PatientBookingStepper`; styles `patient-booking-dialog-styles.ts`.
- **Logic:** `src/lib/patient-booking-wizard.ts` — **3 steps** (`1` Doctor & Type, `2` Date & Time, `3` Details); one visible panel per step (no ghost step); `shouldShowDoctorTypeSection` / `shouldShowScheduleSection` / `shouldShowConfirmSection`; tests in `src/lib/__tests__/patient-booking-wizard.test.ts`.
- **Header:** `PatientBookingDialogHeader` — responsive grid: title + description (left), stepper **1–3** (center), close (right).
- **Doctor step 1 UI:** `DoctorDirectoryPickerList` (collapse after pick, `fillHeight` scroll) / `DoctorDirectoryPickerCard` — `DoctorAvailabilityGroups` `layout="inline"`; `DoctorDirectoryServiceChips` via `resolveDoctorBookableTypes` + `formatAppointmentTypeChipMeta` (globals violet, custom sky, buf + step).
- **Scheduling parity:** `GET /api/doctors` → `bookable_appointment_types` (`mergeBookableTypesForDoctor`); appointment-type tiles use `formatAppointmentTypeBufferLine` / `formatAppointmentTypeSlotStepLine`; catalog rows include buffers (`GET /api/appointment-types/catalog`).
- **Types/hooks:** `doctor-directory.ts`, `doctor-bookable-types.ts` (`filterBookableTypesForDoctorFromApi`, `mergeBookableTypesForDoctor`), `appointment-type-scheduling-meta.ts`; `useDoctorsDirectory` → `queryKeys.doctors.all`; `usePatientBookableAppointmentTypes` → `appointmentTypes.byDoctor` + directory seed (enabled globals + owned/custom only).
- **Prefetch:** `prefetchDoctorsDirectory` (`src/lib/prefetch-doctors-directory.ts`) — portal `useLayoutEffect`, `/services` card hover/focus, dialog open; `prefetchAppointmentTypesForDoctor` (`src/lib/prefetch-appointment-types.ts`) — same 5min `staleTime` as wizard type query.
- **Consumers:** `/patient-portal` (`BookAppointmentDialog` default trigger); `/services` imports `PatientBookingDialog` directly (`preselectedDoctorId`, `lockDoctor`, custom trigger); locked inactive doctor → read-only card + Close. `PatientPortalPage` re-exports `BookAppointmentDialog` alias.
- **UI:** Sky glass 90% dialog; step 1 `fillLayout` — doctor + type panels flex-scroll to footer; one section visible per step.
- **Step 2 scheduling:** `SchedulingPanel` `layout="split"` — calendar left, scrollable slot rail right (`SchedulingSlotChipGrid` `variant="rail"`); booked/past/blocked greyed; flexible = calendar + hint in rail (time on step 3).
- **Persist:** TanStack cache buster **`v4`** (`availability.dates` scopeKey: type UUID or `flex:30`).
- **Seed:** `npm run db:seed-extended` — Physio Theraphy, Test Report Show, patch doctor-owned types with 5m buffers.
- **Data:** `useSchedulingMonthDates` (`SchedulingScopeKey`), `useSchedulingDayGrid`; `prefetchSchedulingMonthWithAdjacent` on patient step 2 + staff dialog open (typed/flex); adjacent months on calendar nav.
- **Submit:** `POST /api/patient-portal` — `chief_complaint` from step-3 reason; **title auto-generated** (`{type} · {patient} · {date}`); `appointment_type_id`; server `assertSlotAvailableForBooking` (409 if taken).
- **Submit UX:** Step 3 **Confirm Request** is `type="button"` (`handleConfirmBooking`) — form `onSubmit` only `preventDefault` (no auto-book on Next / Enter).
- **Invalidation:** `invalidateAfterAppointmentMutation` on success (includes `patientPortal.all`, appointments, dashboard, notifications, type-derived keys; doctor directory refreshes via existing `invalidateUsersAndAuth` / `invalidateDoctorSchedule` → `doctors.all`).
- **A11y:** visible `DialogDescription` without custom `id` so Radix `descriptionId` matches `aria-describedby` on content.

### Doctor Portal (`/doctor-portal`)

- **Route:** `src/app/doctor-portal/page.tsx` — SSR `prefetchDoctorPortal(session.userId)`; client `DoctorPortalPage.tsx`.
- **API:** `GET /api/doctor-portal` → `DoctorPortalData` (`queryKeys.doctorPortal.all`): doctor user row, today/upcoming appointments, patients where `primary_doctor_id = doctor` (take 50), global appointment types + per-doctor `DoctorAppointmentTypeConfig`, appointment metrics.
- **Chrome:** `PortalDoctorChromeHeader` — `pageChromeTitleStackClass` (tight title + subtitle like insights); square `DoctorAvatar` in icon tile; specialty badge on title row; Today date right.
- **Login:** `resolveRoleHomeHref` (`src/lib/role-home-href.ts`, tests `role-home-href.test.ts`) on `/login`, `/home`, landing demo, Google OAuth — doctors always `/doctor-portal` (ignores stale `?redirect=/dashboard`). Proxy authed `/login` → `/home`. Navbar `/dashboard` for doctors = explicit nav (not default landing).
- **Accept invitation:** `AcceptInvitationPage` — `POST /api/invitations/accept` → `invalidateSharingAndAppointments`; success **Continue** → `resolveRoleHomeHref(role)`.
- **Patient tables:** `PatientIdentityCell` shows `PatientAgeGlassBadge` beside name (CP + doctor-portal roster).
- **Stats:** `DoctorPortalStatsRow` — four `PatientStatCard` metrics (Today / This Week / This Month / Pending); responsive `grid-cols-2 sm:grid-cols-4`; only numeric slots pulse (`portalLoading`).
- **Panels:** [Today | Upcoming] (`lg:2-col`) · [Weekly Hours \| Global visit types] (`lg:2-col`) · [Unavailable Dates \| Additional Appointment Types] (`lg:2-col`) · **Related Billing** (`DoctorPortalInvoicesCard`) · **Related Patients** (`DoctorPortalPatientsCard`). Stacked headers (`headerVariant="stacked"` + `PortalPanelSubsectionHeader`): possessive title, `PortalPanelCountBadge`, status outline chip (`PortalPanelStatusOutlineChip`), muted subtitle. Glass tints: `doctorPortalBillingPanelClass` (sky), `doctorPortalPatientsPanelClass` (emerald). Collapsible add chips on schedule/type panels. Shared editors under `src/components/shared/doctor-settings/`.
- **Labels + forms:** `DoctorSettingsFieldLabel` (`mb-1`, `text-xs`, required `*` `text-sm`); `SchedulingDatetimeRangeFields`; `doctor-settings-form-validity.ts` + `DoctorSettingsFormActions.saveDisabled`.
- **Visit types (two mechanisms):** Globals — checkbox enable immediate; **disable** → `ConfirmActionDialog` (`warning`) then `POST /api/appointment-types/doctor-config` `is_enabled: false`. Owned additional — enable immediate; **disable** → same warning confirm then `PATCH` `is_active: false`; **delete** → `ConfirmActionDialog` (`destructive`). Copy: `src/lib/confirm-delete-dialog-copy.ts`. Owned create/edit includes visit fee (`appointment-type-price.ts`, `VisitFeeBadge`). Serializer: `fetchAppointmentTypesForDoctorManager` + `prefetchDoctorPortalSettings`; booking via `filterBookableTypesForDoctorFromApi`.
- **Filter UI:** `FilterSelect` (`calendar/Filters.tsx`, `PatientManagement` toolbar, weekly Day field). Navbar `fixed` + `portal-z-index.ts` so body-portalled menus do not cover chrome.
- **SSR + cache:** `prefetchDoctorPortalSettings` on `/doctor-portal` page (parallel with `prefetchDoctorPortal`) — seeds availability, timeOff, appointment types before paint; `seedDoctorPortalSettingsCache` in `useLayoutEffect`; editors use `initialData` on `useQuery` (no list skeleton on refresh). Client fallback: `prefetchDoctorScheduleSettings`. **Add chips:** `portalSelfService` on portal editors — glass add actions stay visible on refresh (not gated on `useAuth` hydration).
- **Visit types:** `POST /api/appointment-types/doctor-config` → `invalidateAppointmentTypeDerived` (+ `doctorPortal.all`); CP admin toggle also `invalidateAdminPortal`; portal skips `router.refresh()`.
- **Admin → doctor:** `notifyDoctorSettingsChangedByAdmin` (`src/lib/doctor-settings-notify.ts`) on availability/time-off/type APIs when admin mutates another doctor (in-app notification + email).
- **API:** `PATCH /api/doctor-availability/[id]` + `PATCH /api/doctor-time-off/[id]` for inline edit (Vitest: `doctor-availability-patch.test.ts`; time-off PATCH contract not yet mirrored in tests).
- **Related Patients:** `DoctorPortalPatientsCard` — title/subtitle/counts from `doctor-portal-patients-display.ts` (`Active: n · Inactive: n` on full roster, not toolbar-filtered). Body: `PatientListFiltersProvider` + `PatientManagementInner` `variant="doctor-portal"` (search, status, care tier; no Add/Import/Export); links `patientDetailHref("doctor", id)`.
- **Related Billing:** `DoctorPortalInvoicesCard` — `doctor-portal-billing-display.ts` status chip; compact rows (`DoctorPortalInvoiceListRow`, patient strip, visit meta, issued-by). Invoice delete uses `ConfirmActionDialog` via `InvoiceAdminActionsMenu` (not raw `AlertDialog`). SSR: `prefetchInvoices` + visit summaries on `doctor-portal/page.tsx`.
- **Schedule confirms:** Weekly hours + unavailable dates row delete → `ConfirmActionDialog` (`destructive`) with dynamic copy in `confirm-delete-dialog-copy.ts`; mutations still use `invalidateDoctorSchedule`.
- **Cache:** `useLayoutEffect` always seeds `doctorPortal.all` + `patients.all` (including `[]`) so roster CRUD via `usePatients` updates portal without refresh. `prefetchDoctorPortal` and `GET /api/doctor-portal` include `primary_doctor` on roster patients (`patientUserPick`). `useQuery` uses `initialData` + `staleTime: 3min`.
- **Invalidation:** `invalidateEntityAffectingAppointments("patients")` and `usePatients` mutations also call `invalidateDoctorPortal`; appointments → `invalidateAfterAppointmentMutation`.
- **Shell:** `dashboardShellClass` adds `pb-3` for portal routes in `AuthShell` (`src/lib/dashboard-layout.ts`).
- **Sonner CRUD copy:** `src/lib/crud-notify-messages.ts` + Vitest `crud-notify-messages.test.ts` — dynamic subtitles for weekly hours, time off, global/owned visit types (`useAppointmentTypes`), patient booking (`PatientBookingDialog` uses mutation `variables` + `notifyMeta`), invoices (`usePayments`), organizations/members (`useOrganization`), notifications bulk (`useNotifications`); wired in doctor-settings editors + hooks above.
- **Verify (pre-commit):** `npm test && npx tsc --noEmit && npm run lint && npm run build` — **625 tests** (113 files); includes `confirm-delete-dialog-copy.test.tsx`, `doctor-portal-billing-display.test.ts`, `doctor-portal-patients-display.test.ts`, `crud-notify-messages.test.ts`.
- **Invalidation (visit types):** `invalidateAppointmentTypeDerived` centralizes `doctorPortal.all` (portal toggles + CP `DoctorGlobalTypeConfigEditor`); CP also `invalidateAdminPortal`.
- **Section counts:** `PortalPanelCountBadge` + `PortalPanelSubsectionHeader` on Today, Upcoming, billing, patients, schedule panels (TanStack cache — updates on CRUD without refresh).
- **Insights v2:** `/insights` — Recharts-only `AnalyticsPage`; **`InsightsPageChrome`** / **`insights-page-copy.ts`**; **`InsightsDataErrorBanner`**; **scope** (`InsightsScopeToolbar`); **period** = `day|week|month|year|**all**`; KPI strip = calendar windows; **Doctors** (`AnalyticsDoctorInsightsSection`); **chart UX (display-only):** `AnalyticsChartShell` + `AnalyticsResponsiveChartContainer` (`h-[220px] sm:h-[260px]`); multi-line horizontal X via `{analyticsChartSlopedXAxisEl()}` + `wrapCategoryAxisLabel`; config-driven plot tooltips `{analyticsChartTooltipEl(_, { config })}` (series names from `getAnalyticsChartValueSeriesLabel` / stacked `ChartConfig`, not hardcoded Count); on-point labels via `AnalyticsChartValueLabelList`; stacked totals `AnalyticsStackedTotalLabel`; pie `AnalyticsPieSliceLabel` + `AnalyticsPieSliceLabelLine` (zero-count slices filtered before render); `PortalPanelSection` `clipContent={false}`; **no query/invalidation changes** — `invalidateInsightsAndAnalytics`, Redis 90s, SSR `prefetchInsights`, buster **`v6`**, cross-tab `BroadcastChannel`.

### Control panel entity split (users vs patients)

- **`patients` table** (`Patient` model): clinical/client records used by Patient Management and appointments. Demo seed creates one row aligned with `test@patient.com` so `/control-panel/patient-management` lists a sample patient.
- **`users` table** (`User` model): auth accounts with `role`. **Doctor Management** lists `GET /api/users?role=doctor`. **User / Admin Management** lists `GET /api/users?role=admin` (admin only; excludes doctor/patient rows).
- **`ControlPanelPage` tabs**: `/control-panel/patient-management` renders TanStack `PatientManagement`; `/control-panel/doctor-management` and `/control-panel/user-admin-management` render filtered user tables. Legacy URL `/control-panel/doctor-user-management` still maps to the doctors tab.
- **Hooks**: `useUsers({ role: "doctor" })`, `useUsers({ role: "admin" })`, or unfiltered list — query key includes the filter object; `invalidateUsersAndAuth` refreshes after PATCH.
- **Demo list cap:** `CP_DOCTOR_USERS_FILTERS` / `CP_ADMIN_USERS_FILTERS` use `limit: 200` (`control-panel-users-filters.ts`). Pagination API supports `offset`; **`CpListPaginationDevStub`** shows disabled Load more + implementer note.
- **CP dev-stub UI (demo-only submit):** `src/lib/cp-dev-stub-copy.ts` — copy + API hints. **`DoctorFormDialog`** / **`AdminUserFormDialog`** accept `mode="create"` + `devStub` → disabled Save + **`CpDevStubSubmitNote`**. Doctor **Add** + **Delete** confirm (`ConfirmActionDialog.confirmDisabled`) preview routes; **Edit** + **Deactivate** stay live. Admin **Add** preview-only (register/Google creates admins). Production forks wire POST/DELETE/offset + `invalidateUsersAndAuth`.
- **Doctor detail assigned patients:** `GET /api/doctors/[id]/assigned-patients`, `useDoctorAssignedPatients`, `invalidateDoctorAssignedPatients` on patient CRUD — live on CP doctor detail without refresh.
- **User detail routes:** `/control-panel/users/[id]` → admin `AdminUserDetailScreen`; doctor ids redirect to `/control-panel/doctors/[id]`.

### Demo seed

Run `npm run db:seed-test-user` after migrations: upserts demo `users`, doctor availability + global types, demo `patients` row with merged `clinical_profile` (allergies, notes, `image_url` via `src/lib/seed-clinical-profile.ts`). Run `npm run db:seed-extended` for: admin staff fields, six professional **categories** (stable UUIDs, color/icon/description), doctor v006 profiles, extra patients (Maria/Jan/Anya/Thomas) with portraits `/users/img-4`–`img-7`, type configs, typed appointments. Optional: `npm run db:seed-demo-clinical` re-merges demo patient clinical JSON idempotently.

### Patient pipeline (management + detail)

- **Schema**: `Patient.clinical_profile` (`Json?`) — merged on `PUT /api/patients/[id]` (not fully replaced); **email is never updated from the client** on PUT (demo safety).
- **API**: `GET /api/patients/[id]` and `GET /api/patients/[id]/snapshot` gated by `resolvePatientAccess` (403 when `none`; `?fromDoctor=` for roster-only view). Snapshot returns `{ patient, appointments, invoices }` (invoices via `appointment_id`). Appointment rows include `doctor_specialty`, `calendar_owner_image`, and `doctor_image` for portrait cells (avoids robohash when DB has `User.image`).
- **React Query**: `usePatient(id, rosterDoctorId?)` / `usePatientSnapshot(id, rosterDoctorId?)` forward roster query to API. Prefix invalidation `queryKeys.patients.all` refreshes list, detail, and snapshot together.
- **Invalidation wiring**: `invalidateAfterAppointmentMutation` calls `invalidateInvoicesAndOverview`, which now also invalidates `queryKeys.patients.all` (appointments + invoices affect patient aggregates). `invalidateSharingAndAppointments` invalidates `patients.all` so assignee changes refresh snapshots without navigation.
- **SSR pages**: `src/app/control-panel/patients/[id]/page.tsx` and `src/app/patients/[id]/page.tsx` use `export const dynamic = "force-dynamic"` and parallel prefetch (`prefetchPatient`, `prefetchPatientSnapshot`, `prefetchDoctors`). Control-panel **layout** (`control-panel/layout.tsx`) keeps sidebar mounted; detail route only hydrates the right pane.
- **UI (list)**: `PatientListFiltersProvider` + status dropdown; `DataTable` global filter; row ⋮ **View** → detail route; **Edit** → **`PatientFormDialog`** (glass 90vw×90vh, emerald). Primary doctor: **`PatientPrimaryDoctorPickerField`** + `DoctorDirectoryPickerList` (same as appointment treating-physician picker). Required `*` via **`FormRequiredMark`**.
- **UI (detail)**: **`PatientDetailScreen`** — SSR `accessLevel`; chrome + footer stay mounted; **`PatientDetailBodySkeleton`** pulses schema/table slots only; horizontal **`PatientDetailDefinitionRow`** (`patient-detail-ui-classes.ts`, `gap-2`); **`EntityDetailRecordAuditCard`**; sticky footer via **`resolveEntityDetailRootClass`**. **Update Profile** opens **`PatientFormDialog`**. **`CategoryDetailScreenShared`** — same layout/table pattern; portal tone amber, CP sky + CRUD footer.
- **Shared table patterns**: **`ClinicalDataTable`** + `patient-detail-snapshot-columns.tsx` — category column `break-words`; single table border (`tableFrameClassName`, not double card frame). **`DoctorIdentityCell`** merges snapshot images + `useUsers` doctor map. CP + doctor-portal list **Edit** opens **`PatientFormDialog`** (same as detail **Update Profile**).
- **Loading**: `src/app/control-panel/loading.tsx` returns `null` so route transitions don't flash a full skeleton; tables keep localized skeleton rows via `DataTable` `isLoading`.

### Clinical table UI (audit glance — display-only)

| Phase | Status | Files |
|-------|--------|-------|
| Tokens | ✓ | `src/lib/table-display-styles.ts` (`clinicalTableHeadClass` → `DataTableColumnHeader`) |
| Identity cells | ✓ | `person-display/*`, `DoctorIdentityRow.tsx` |
| Patient list | ✓ | `PatientManagement.tsx` |
| Patient detail snapshots | ✓ | `PatientDetailScreen.tsx`, `patient-detail-snapshot-columns.tsx`, `ClinicalDataTable.tsx` |
| CP rollout | ✓ | `DoctorManagement.tsx`, `UserManagement.tsx`; Category unchanged (`DataTableColumnHeader`) |
| Out of scope | — | Calendar/portals `DoctorLinkStack`; invoice detail raw `<Table>` |

**Data layer:** no API/query-key/cache-version changes. Portrait/snapshot refresh via existing `invalidateEntityAffectingAppointments`, `invalidateAfterAppointmentMutation`, `queryKeys.patients.snapshot` — unchanged.

**Verify:** `npm test` (374) · `npx tsc --noEmit` · `npm run lint` · `npm run build`.

### Avatar cropping (detail pages)

User detail SSR page uses `Avatar` + `AvatarImage` with `className="object-cover object-center"` and `overflow-hidden` on the root so portrait photos are not stretched inside circles (same treatment as list rows and navbar).

### Safe image fallback

- `src/components/ui/safe-image.tsx`: `next/image` first, automatic native `<img>` fallback on `onError` for remote URLs (Vercel optimizer 402 / quota). See `docs/SAFE_IMAGE_REUSABLE_COMPONENT.md`.
- `src/components/shared/UserAvatar.tsx`: skeleton + initials + `SafeImage` for remote `src`.
- **Consumers:** `DoctorAvatar`, `DoctorCardHeroImage`, `DoctorMiniAvatar`, `PatientPortraitAvatar`, CP doctor/user detail, appointment dialog, `FilePreview` (blob previews), login demo avatars, landing about cards. Local static assets (`/logo.svg`, `/images/*`) stay on raw `next/image`.
- `next.config.ts` `images.remotePatterns`: `robohash.org`, `*.public.blob.vercel-storage.com` (sync with `src/lib/vercelBlob.ts`).

### Production guardrails (Vercel)

| Layer | Location | Role |
|-------|----------|------|
| Edge proxy | `src/proxy.ts` | JWT, route guards, CSP + framing (public vs protected), page `Cache-Control`; matcher skips `_next`, `api`, static files |
| Next headers | `next.config.ts` | `securityHeaders` from `src/lib/security-headers.ts`; prod `/_next/static` immutable |
| Vercel edge | `vercel.json` | Same security headers + `/_next/static` immutable; crons |
| Crawlers | `src/app/robots.ts` | Disallow `/_next/`, `/api/`, CP, dashboards, portals, UUID entity routes; block AI scrapers |
| Layout | `src/app/layout.tsx` | `data-scroll-behavior="smooth"` |
| Rate limits | `src/lib/rate-limit.ts` | Auth + API caps (in-memory; Redis optional per `src/lib/redis.ts`) |
| Dashboard (manual) | Vercel → Firewall | Bot Protection ON, AI Bots ON — not in repo |

**Not changed by guardrails pass:** TanStack invalidation, query keys, prefetch, Redis dashboard cache — existing mutation helpers still bust all affected views without navigation.

**Verify after deploy:** `npm test && npx tsc --noEmit && npm run lint && npm run build`. Post-deploy: Observability → Edge Requests / Bot Name (T+15m, T+1h). Full checklist: `docs/VERCEL_PRODUCTION_GUARDRAILS.md`.

**Implementation audit (SafeImage + guardrails):** All plan phases done. Remaining raw `next/image`: local static only (navbar logo, login/register hero, `safe-image.tsx` internal). Out of scope: `PatientPortalPage` `DoctorLinkStack`. Invalidation unchanged.

### Table / list UX (related)

- `DataTable` loading: headers static, skeleton body rows only.
- Management tables: `meta.headClassName` / `meta.cellClassName` for stable layout.

---

## Control-Panel Layout Architecture

The control panel (`/control-panel/*`) uses a **viewport-locked inner-scroll** pattern — the same pattern as the `stock-inventory` admin panel reference.

```bash
AuthShell (h-dvh, overflow-hidden, sets html.style.overflow = "hidden")
└─ app/control-panel/layout.tsx         ← persistent layout wrapper
   ├─ ControlPanelSidebarNav            ← sticky desktop sidebar (h-full, cp-right-scroll)
   │  ├─ Sections + TabsTrigger items   ← click → router.replace (no scroll)
   │  └─ Scroll indicator               ← gradient + bouncing ChevronDown when overflowing
   └─ <div class="cp-right-scroll flex-1 overflow-y-auto">
      └─ {children}                     ← each tab's page.tsx renders its component
```

**Key files:**

- `src/app/control-panel/layout.tsx` — wraps `ControlPanelSidebarNav` + scrollable right pane. Has `bg-gradient-to-br from-slate-50 via-white to-slate-100` to prevent the black-flash hydration bug.
- `src/components/control-panel/ControlPanelSidebarNav.tsx` — client component, reads `pathname`, calls `router.replace()` on tab change.
- `src/components/control-panel/ControlPanelSectionServerPage.tsx` — shared async server entry for dedicated CP list routes; `prefetchControlPanelSection` + `ControlPanelSectionPageClient` seed cache.
- `src/lib/control-panel-section-layout.ts` — re-exports `controlPanelSectionRootClass` + `controlPanelSectionErrorBannerClass` from `section-page-layout.ts`.
- `src/lib/section-page-layout.ts` — `appSectionRootClass`, `appPortalSectionRootClass`, `appEntityDetailRootClass`, `resolveAppSectionRootClass`, `appSectionErrorBannerClass`.
- `src/components/shared/AppSectionErrorBanner.tsx` — shared inline fetch failure banner.
- `src/components/pages/ControlPanelPage.tsx` — thin deprecated wrapper; mobile nav lives in `ControlPanelMobileNav` / `ControlPanelSectionPageClient`.

**CSS globals (src/styles/globals.css):**

```css
/* Hides scrollbar track without disabling scroll — no gutter reservation. */
.cp-right-scroll { scrollbar-width: none; }
.cp-right-scroll::-webkit-scrollbar { display: none; }
```

**AuthShell (src/app/AuthShell.tsx):**

```tsx
/* Locks viewport for dashboard + control-panel routes so html scrollbar-gutter
   doesn't reserve phantom right-padding. Restored on navigation to other routes. */
useEffect(() => {
  const html = document.documentElement;
  if (isDashboard || isControlPanel) {
    html.style.setProperty("overflow", "hidden");
  } else {
    html.style.removeProperty("overflow");
  }
  return () => { html.style.removeProperty("overflow"); };
}, [isDashboard, isControlPanel]);
```

---

## Inline Skeleton Loading Strategy

The gold standard is **PatientManagement**. Every page in the codebase now follows this pattern:

### Rules

1. **No full-page skeleton replacement.** Never do `if (isLoading) return <BigSkeleton />`.
2. **All chrome stays mounted** — cards, buttons, filters, titles, subtitles, icons, table headers. These never flicker.
3. **Only data slots pulse** — numeric values, table body rows, list items, profile field values.
4. **`isMounted` + `requestAnimationFrame` guard** prevents server/client hydration mismatch:

```tsx
const [isMounted, setIsMounted] = useState(false);
useEffect(() => {
  requestAnimationFrame(() => setIsMounted(true));
}, []);

const loading = !isMounted || isLoading;
```

### Reference implementation (PatientManagement)

- `PatientStatCard.tsx` — only the `value` slot receives `<Skeleton>`, everything else (card, icon, title, badge) is real DOM.
- `PatientManagementStatsRow.tsx` — passes `valueSkeleton={listBodyLoading}`.
- `PatientManagement.tsx` — `DataTable` keeps headers/columns, skeleton rows replace only body cells.
- `loading.tsx` at `src/app/control-panel/loading.tsx` returns `null` (prevents flash during tab navigation).

### Pages converted to inline skeleton

| Page | File | Skeleton areas |
|---|---|---|
| Dashboard Overview | `control-panel/DashboardOverview.tsx` | Stat value slots + next-appt/recent list content |
| Telehealth Queue | `pages/TelehealthDashboard.tsx` | Up Next card body + queue rows |
| Appointment Access | `control-panel/InvitationList.tsx` | Invitation table rows |
| User Access | `control-panel/InvitationList.tsx` | Invitation table rows (shared component) |
| Organization Mgmt | `control-panel/OrganizationManagement.tsx` | Count subtitle + table rows |
| Invoice Mgmt | `control-panel/InvoiceManagement.tsx` | Summary card values + table rows |
| Appointments Mgmt | `control-panel/AppointmentsManagement.tsx` | Stat card values + table rows |
| Notifications | `control-panel/NotificationsManagement.tsx` | Table rows |
| Google Calendar | `control-panel/GoogleCalendarSettings.tsx` | Status badge + description + action button |
| Insights | `pages/AnalyticsPage.tsx` | Stat values + chart bars + category rows + patient table rows |
| Doctor Portal | `pages/DoctorPortalPage.tsx` | `PortalDoctorChromeHeader` + stat values + `PortalPanelSection` bodies; `PatientManagementInner` table body rows only |
| Patient Portal | `pages/PatientPortalPage.tsx` | Profile/summary chrome + **Appointment History** via `PortalAppointmentTimelineCard`; booking via `PatientBookingDialog` |
| Services | `pages/ServicesPage.tsx` | `DoctorProfileCardSkeleton` text slots; doctor filter bar (incl. catalog type select) + card chrome static |

### Deleted loading.tsx files

- `src/app/insights/loading.tsx` — deleted; replaced by inline skeleton in `AnalyticsPage.tsx`
- `src/app/patient-portal/loading.tsx` — deleted; replaced by inline skeleton in `PatientPortalPage.tsx`

### Portal chrome / nav stability

Shared primitives keep layout fixed while data loads:

| Piece | File | Role |
|-------|------|------|
| `PortalChromeHeader` | `src/components/shared/PortalChromeHeader.tsx` | Icon tile + title stack; optional `actions` + `toolbar` rows; tokens in `page-chrome-classes.ts` |
| `PortalDoctorChromeHeader` | `src/components/shared/PortalDoctorChromeHeader.tsx` | Doctor portal top row — avatar tile, name, email, `DoctorSpecialtyBadge`, Today date |
| `PortalPanelSection` | `src/components/shared/PortalPanelSection.tsx` | White in-card section shell + heading badge (patient/doctor portal panels) |
| `DoctorPortalStatsRow` | `src/components/doctor-portal/DoctorPortalStatsRow.tsx` | Doctor portal metric cards (`PatientStatCard` reuse) |
| `page-chrome-classes.ts` | `src/lib/page-chrome-classes.ts` | `border-b py-2`, icon tile `min-h-[3.5rem]`, `pageHeaderRootClass`, `pageChromeTitleStackClass`, `portalPanelSectionHeadingClass`, toolbar-only shell |
| `dashboardShellClass` | `src/lib/dashboard-layout.ts` | `max-w-9xl` + horizontal padding + `pb-3` on scrollable portal pages via `AuthShell` |
| `PageToolbarChrome` | `src/components/shared/PageToolbarChrome.tsx` | `/dashboard` — toolbar only (no Appointments title/icon) |
| `CalendarHeaderRoleActions` | `src/components/calendar/CalendarHeaderRoleActions.tsx` | Dashboard toolbar: patient Book vs staff Import/New (SSR role, no flash) |
| `PatientBookingDialog` | `src/components/shared/patient-booking/PatientBookingDialog.tsx` | Patient/services booking wizard — directory cards step 1, inline slots, `lockDoctor` on services |
| `DoctorDirectoryPickerCard` | `src/components/shared/doctor-display/DoctorDirectoryPickerCard.tsx` | Booking + locked services doctor preview (availability + service chips) |
| `PortalStaffLink` | `src/components/shared/PortalStaffLink.tsx` | Sky link to `/doctors/:id` for doctor staff on portal cards |
| `portal-appointment.ts` | `src/lib/portal-appointment.ts` | `portalAppointmentToFullAppointment` adapter for timeline cards |
| `ProfileDefinitionRow` | `src/components/shared/profile/ProfileDefinitionRow.tsx` | `<dl>` row: icon + label static; variant-matched skeleton in `dd` only (`doctorStack` = Primary Doctor height) |
| `DoctorProfileCardSkeleton` | `src/components/shared/services/DoctorProfileCardSkeleton.tsx` | 1:1 `/services` doctor card shell |
| `useNavSession` | `src/hooks/useNavSession.ts` | Role from `NavRoleContext` (SSR) + `useAuth` / query cache — no localStorage during render |
| `NavRoleProvider` | `src/context/NavRoleContext.tsx` | `initialNavRole` from root layout — hydration-safe navbar |

**SSR + client:** root `layout.tsx` passes `initialNavRole` into `AuthShell`. Portal pages pass `initialData` on `useQuery`. Profile: `profileLoading = isLoading && !patient`. Navbar role links render when `role` is known (server + client match).

**Audit (agent glance):** Navbar `fixed` + `Z_NAVBAR`. **Insights v2:** `period=all` + doctor charts; **chart UX polish:** multi-line horizontal X (`wrapCategoryAxisLabel`), config tooltips (Appointments/Revenue/Hours/Done/Pending/Alert), `AnalyticsChartValueLabelList`; display-only — no invalidation changes; **357** tests (52 files) + tsc + lint. Redis insights (90s) + `invalidateAfterDoctorScheduleMutation`.

### Dashboard calendar shared UI (unified `AppointmentCard`)

| Piece | File | Role |
|-------|------|------|
| `AppointmentCard` | `src/components/shared/AppointmentCard.tsx` | Single card UI — variants `list` \| `month-panel` \| `popover` \| `compact` \| `minimal` |
| `AppointmentHoverCard` | `src/components/calendar/AppointmentHoverCard.tsx` | Radix hover wrapper; popover body + grid triggers delegate to `AppointmentCard` |
| `appointment-card.ts` | `src/lib/appointment-card.ts` | `deriveCardDensity`, `w-[320px]` popover, patient/status helpers |
| `appointment-assignees.ts` | `src/lib/appointment-assignees.ts` | `dedupeAssignees` |
| `useAppointmentCardModel` | `src/hooks/useAppointmentCardModel.ts` | Colors, labels, RBAC capabilities per card |
| `AppointmentCardMetaRow` | `src/components/shared/AppointmentCardMetaRow.tsx` | Lucide meta rows (date, time, client, category, status, notes, …) |
| `CategoryInlineLink` | `src/components/shared/CategoryInlineLink.tsx` | Category color dot + `RoleEntityLink` |
| `appointment-date-tags.ts` | `src/lib/appointment-date-tags.ts` | Today / Tomorrow / Later / Passed |
| `AppointmentDateTag` / `AppointmentTitleRow` | `src/components/shared/` | Title row; `titleLayout: stacked` on month side panel |
| `appointment-menu-permissions.ts` | `src/lib/appointment-menu-permissions.ts` | Menu capability flags |
| `AppointmentActionsMenu` | `src/components/shared/AppointmentActionsMenu.tsx` | ⋮ always shown; items disabled when denied |
| `appointment-card.test.ts` | `src/lib/__tests__/appointment-card.test.ts` | `dedupeAssignees`, `deriveCardDensity` |
| `portal-appointment.test.ts` | `src/lib/__tests__/portal-appointment.test.ts` | Portal serializer + `portalDoctorProfileHref` |
| `appointmentCardMetaGroupClass` | `src/lib/appointment-card.ts` | Shared `gap-x-4` meta row wrapper (dashboard + portal) |

**Wiring:** `HomePage` → `AppointmentDataProvider` → `useAppointments` seeds `queryKeys.appointments.all`; SSR `dashboard/page.tsx` prefetches patients + categories. All four views read same cache; mutations use `invalidateAfterAppointmentMutation` (not narrow `invalidateAppointmentData` from calendar edit handlers).

| Tab | Entry | Notes |
|-----|-------|-------|
| List | `AppointmentList` | `variant="list"`; `useOwnerUserSummaries` + `useAssignees` |
| Month | `MonthView` side panel | `variant="month-panel"`; ⋮ top-right in card header |
| Month/Day/Week cells | `AppointmentHoverCard` | Fixed-width popover; `slotHeightPx` for compact/minimal triggers |
| Day / Week | `DayView` / `WeekView` | `useOwnerUserSummaries`; hover replaces old inline dropdown |

**Patient portal:** Timeline rail (status dot) wraps `AppointmentCard` `variant="list"` `hideActionsRail`. API `mapPortalAppointmentsFromRows` includes `category_data`, `portal_owner` / `portal_treating_physician` (`id`, `role`). Booking still uses `invalidatePatientPortal`.

---

## Glassmorphic UI Style System

Defined in `DashboardOverview.tsx` and reused across control-panel pages:

```tsx
const GLASS_BASE = "rounded-[28px] border bg-gradient-to-br backdrop-blur-sm";
const GLASS_VARIANTS = {
  sky:     "border-sky-400/20 from-sky-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(2,132,199,0.12)]",
  blue:    "border-blue-400/20 from-blue-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(59,130,246,0.12)]",
  indigo:  "border-indigo-400/20 from-indigo-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(99,102,241,0.12)]",
  green:   "border-green-400/20 from-green-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(34,197,94,0.12)]",
  amber:   "border-amber-400/20 from-amber-500/10 via-white to-white/95 shadow-[0_24px_60px_rgba(245,158,11,0.12)]",
  // ...13 total variants in DashboardOverview.tsx
};
```

Rule: table containers use `rounded-[28px]` + colored glass shadow. Stat cards each get a different color variant. The outer container must never clip shadows — no `overflow-hidden` on the layout wrapper that contains cards.

---

## Auth + Proxy Architecture (single source of truth)

```bash
Browser request
    │
    ▼
src/proxy.ts   ← EDGE (Next.js 16+ replaces middleware.ts)
    │  Runs before any page renders — at CDN/edge layer
    │
    │  1. Static short-circuit: _next/static, images, fonts
    │     → set immutable Cache-Control + CDN-Cache-Control, NextResponse.next()
    │
    │  2. JWT verification (jose — Web Crypto, edge-compatible)
    │     • reads httpOnly "auth-token" cookie
    │     • verifies signature + expiry
    │
    │  3. Route guards
    │     • Unauthenticated + protected route → redirect /login?redirect=<path>
    │     • Authenticated + /login|/register  → redirect /dashboard
    │
    │  4. Identity forwarding
    │     • Injects x-user-id + x-user-email into request headers
    │     • Server components/API routes read these instead of re-verifying JWT
    │     • Strips any client-spoofed x-user-* headers first
    │
    │  5. Security headers on every response
    │     CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
    │
    │  6. Cache-Control + CDN-Cache-Control per route type
    │     static/assets → immutable (1yr) | landing → 60s SWR | protected → no-cache | API → no-store
    │
    │  7. Prefetch Link headers
    │     /login → /dashboard | / → /login,/register | /dashboard → /control-panel,/analytics
    │
    ▼
Next.js Server renders page (no extra cookie checks needed)
    • Server components read x-user-id from headers() — zero JWT work
    ▼
AuthShell (client)  ← LAYOUT ONLY, no redirect logic
    │  • isBare(pathname) → raw children (landing, login, register)
    │  • else → <Navbar> + children + VideoCall + QuickActionsModal
    ▼
useAuth hook  ← React Query → /api/auth/me
    • staleTime 5 min, used for UI personalisation (avatar, name)
    • NOT used for route guarding (proxy handles that at the edge)
```

### Session cookie

- Name: `auth-token` (constant in `src/lib/constants.ts` → `SESSION.COOKIE_NAME`)
- httpOnly, Secure (prod), SameSite=Lax, maxAge 7 days
- Set by: `/api/auth/login`, `/api/auth/register`, `/api/auth/demo`, `/api/auth/callback/google`
- Cleared by: `/api/auth/logout`
- Verified server-side by: `src/lib/session.ts → getSessionUser()` (uses `jsonwebtoken` in Node runtime)
- Verified at edge by: `src/middleware.ts` (uses `jose`)

### No-flash strategy

1. `<html style="background-color:#0f172a">` inline in `layout.tsx` → dark canvas painted on first byte, before CSS arrives.
2. `<meta name="theme-color" content="#0f172a">` → browser chrome matches.
3. Middleware redirects happen at edge before HTML is sent → browser never renders a wrong page.
4. AuthShell renders the correct layout immediately (no loading placeholder, no dark div flash).

---

## Directory Structure

```bash
src/
├── app/
│   ├── layout.tsx                  Root layout — html/body, AuthShell wrapper
│   ├── page.tsx                    Landing page (public)
│   ├── AuthShell.tsx               Client layout shell (bare vs dashboard chrome)
│   │                               Also: viewport-lock effect for dashboard + control-panel
│   ├── middleware.ts               Edge JWT guard (single auth check point)
│   │
│   ├── dashboard/page.tsx          → renders <HomePage /> (protected by middleware)
│   ├── analytics/page.tsx
│   ├── insights/page.tsx           → <AnalyticsPage /> (no loading.tsx — inline skeleton)
│   ├── patient-portal/page.tsx     → <PatientPortalPage /> (no loading.tsx — inline skeleton)
│   │
│   ├── control-panel/
│   │   ├── layout.tsx              Persistent sidebar + scrollable right pane
│   │   ├── loading.tsx             Returns null (prevents tab-nav flash)
│   │   ├── page.tsx                Redirects to dashboard-overview
│   │   ├── appointments/[id]/page.tsx
│   │   ├── categories/[id]/page.tsx
│   │   ├── doctors/[id]/page.tsx
│   │   ├── invoices/[id]/page.tsx      admin invoice detail
│   │   ├── organizations/[id]/page.tsx
│   │   └── patients/[id]/page.tsx
│   ├── invoices/[id]/page.tsx          doctor/patient invoice detail (no CP sidebar)
│   │
│   └── api/
│       ├── auth/login/route.ts       POST — rate limited login
│       ├── auth/register/route.ts    POST — rate limited register
│       ├── auth/demo/route.ts        POST — demo login (no rate limit)
│       ├── auth/logout/route.ts      POST — clear session
│       ├── auth/me/route.ts          GET  — current user (used by useAuth)
│       ├── auth/callback/google/     Google OAuth callback
│       ├── appointments/             CRUD + import-ics + search
│       ├── users/[id]/               CRUD + search
│       ├── patients/                 CRUD + [id]/snapshot
│       ├── relatives/                CRUD
│       ├── invitations/              CRUD
│       ├── organizations/            CRUD
│       ├── invoices/                 CRUD + [id]/record-payment + [id]/refund
│       ├── billing/appointment-options  invoice create picker
│       ├── payments/                 Stripe checkout + webhook
│       ├── notifications/            SSE stream + CRUD
│       ├── analytics/                Aggregated stats
│       ├── insights/                 AI-powered insights
│       ├── dashboard/overview/       Dashboard KPIs (used by useDashboardOverview)
│       ├── patient-portal/           Patient self-service
│       ├── calendar/                 Google Calendar sync/export/import
│       ├── ai/                       Categorise, parse, suggest, summarise
│       └── cron/reminders/           Cron-triggered email reminders
│
├── components/
│   ├── pages/
│   │   ├── LandingPage.tsx          Public marketing page (Ken Burns hero, appointment deck, stats)
│   │   ├── HomePage.tsx             Authenticated dashboard shell
│   │   ├── AnalyticsPage.tsx        Insights — inline skeleton
│   │   ├── PatientPortalPage.tsx    Patient portal — inline skeleton
│   │   ├── PatientDetailView.tsx
│   │   └── TelehealthDashboard.tsx  Telehealth queue — inline skeleton
│   ├── calendar/
│   │   ├── AppointmentList.tsx      List tab → `AppointmentCard variant="list"`
│   │   ├── WeekView.tsx / MonthView.tsx / DayView.tsx  Grid + side panel → `AppointmentHoverCard` + `AppointmentCard`
│   │   ├── AppointmentDialog.tsx    Create/edit appointment modal
│   │   ├── AppointmentHoverCard.tsx Thin hover wrapper → shared `AppointmentCard`
│   │   ├── CalendarHeader.tsx       Fixed sticky header row
│   │   ├── Filters.tsx / SearchBar.tsx
│   │   ├── ImportICSDialog.tsx
│   │   └── VideoCall.tsx            Telehealth video modal
│   ├── control-panel/
│   │   ├── ControlPanelSidebarNav.tsx  Desktop sidebar (client, pathname-aware, scroll indicator)
│   │   ├── DashboardOverview.tsx       Inline skeleton + glassmorphic
│   │   ├── AppointmentsManagement.tsx / AppointmentDetailForm.tsx — inline skeleton + glassmorphic
│   │   ├── DoctorManagement.tsx / DoctorDetailForm.tsx
│   │   ├── PatientManagement.tsx — reference inline skeleton pattern; list Edit uses PatientFormDialog
│   │   ├── PatientStatCard.tsx         Reference value-slot skeleton
│   │   ├── CategoryManagement.tsx / CategoryDetailForm.tsx
│   │   ├── InvoiceManagement.tsx       Inline skeleton + glassmorphic
│   │   ├── OrganizationManagement.tsx  Inline skeleton + glassmorphic
│   │   ├── NotificationsManagement.tsx Inline skeleton
│   │   ├── GoogleCalendarSettings.tsx  Inline skeleton
│   │   └── InvitationList.tsx          Inline skeleton (shared by Appt + User access)
│   ├── navbar/Navbar.tsx
│   ├── login/Login.tsx / register/Register.tsx / logout/Logout.tsx
│   └── shared/
│       ├── PageHeader.tsx
│       ├── DataTable.tsx
│       ├── FilePreview.tsx
│       ├── GlobalSearch.tsx
│       └── QuickActionsModal.tsx
│
├── hooks/
│   ├── useAuth.ts              React Query — /api/auth/me
│   ├── useAppointments.ts      React Query — /api/appointments
│   ├── useUsers.ts             React Query — /api/users (filterable by role/roles)
│   ├── usePatients.ts          + usePatientSnapshot(id)
│   ├── useNotifications.ts     REST list + mutations
│   ├── useNotificationStream.ts SSE listener (QueryProvider only)
│   ├── useOrganization.ts
│   ├── useAnalytics.ts
│   ├── useInsights.ts
│   ├── useDashboardOverview.ts Exposes isFetching + dataUpdatedAt for refresh button
│   ├── useGoogleCalendar.ts
│   ├── usePayments.ts          invoices list + pay + CRUD mutations
│   ├── useInvoice.ts           single invoice detail query
│   ├── useAI.ts
│   ├── useDebounce.ts          300ms default
│   ├── usePrevious.ts          useRef-based prev value
│   ├── useLocalStorage.ts      SSR-safe, with remove()
│   ├── useMediaQuery.ts        Responsive logic
│   └── useAbortController.ts   Race-condition-free fetch
│
├── lib/
│   ├── auth.ts           hashPassword, verifyPassword, generateToken, verifyToken (Node/jsonwebtoken)
│   ├── session.ts        getSessionUser (server), setSession/clearSession (server), getClientSession (client)
│   ├── prisma.ts         Prisma client singleton
│   ├── email.ts          Resend email client
│   ├── email-templates.ts
│   ├── stripe.ts         Stripe client
│   ├── redis.ts          Upstash Redis client + invalidateDashboardOverview(userId)
│   ├── rate-limit.ts     In-memory rate limiter (production: use Redis)
│   ├── rateLimit.ts      checkRateLimit helper
│   ├── google-calendar.ts Google Calendar OAuth + API helpers
│   ├── ai-client.ts      OpenAI / AI SDK client
│   ├── insights-data.ts
│   ├── query-keys.ts     Centralised React Query key factory
│   ├── query-client.ts   invalidateAppointmentData + invalidateUsersAndAuth helpers
│   ├── serializers.ts    DB row → API shape transformers
│   ├── security-headers.ts
│   ├── constants.ts      RATE_LIMITS, PAGINATION, VALIDATION, SESSION, DB_TIMEOUTS
│   ├── calendar-header-action-styles.ts  Shared glassmorphic button class tokens
│   ├── utils.ts          cn(), misc
│   └── validation.ts     isValidEmail, validatePassword
│
├── store/
│   └── useAppStore.ts    Zustand — video call state, quick actions modal
│
├── providers/
│   ├── AppProviders.tsx  Composes QueryProvider + DateProvider + ColorProvider + ToastProvider
│   ├── QueryProvider.tsx TanStack Query client + localStorage persistence (PersistQueryClientProvider)
│   └── ToastProvider.tsx Sonner
│
├── context/
│   ├── DateContext.tsx
│   └── AppointmentColorContext.tsx
│
├── types/
│   ├── types.ts          Appointment, Doctor, Patient, Category, User, Invitation, …
│   └── notification.ts
│
├── styles/
│   └── globals.css       Tailwind v4 imports, Ken Burns keyframes, hero/card bg layers, ripple, CTA shine
│                         Also: .cp-right-scroll (hidden scrollbar), .inner-dashboard-scroll
│
└── proxy.ts               Next.js 16+ edge proxy — auth, cache, security, prefetch hub
```

---

## React Query Key Structure

All keys are prefixed with `"app"` — see `src/lib/query-keys.ts`:

```ts
queryKeys = {
  root: ["app"],                       // invalidates everything (logout only)
  auth:         { me: ["app","auth","me"] },
  appointments: { all: ["app","appointments"], detail: id => [...,"detail",id], ... },
  patients:     { all: ["app","patients"], detail: id => [...,id], snapshot: id => [...,id,"snapshot"] },
  dashboard:    { overview: ["app","dashboard","overview"] },
  invoices:     { all: ["app","invoices"], detail: id => [...,id] },
  users:        { all: ["app","users"], detail: id => [...,id], search: q => [...,"search",q] },
  categories:   { all: ["app","categories"], detail: id => [...,id] },
  organizations:{ all: ["app","organizations"], detail/members subkeys },
  notifications:{ all: ["app","notifications"], unreadCount: [...,"unread-count"] },
  invitations:  { all: ["app","invitations"] },
  availability: { root: ["app","availability"], slots: (doctorId,date,typeId) => [...] },
  googleCalendar: { root: ["app","google-calendar"] },
  insights:     { all: ["app","insights"] },
  analytics:    { all: ["app","analytics"] },
  patientPortal:{ all: ["app","patient-portal"] },
}
```

**Client-side invalidation helpers (`src/lib/query-client.ts`):**

| Helper | What it invalidates |
|---|---|
| `invalidateAfterAppointmentMutation` | appointments + notifications + availability + invoices + dashboard overview + patients + all portals |
| `invalidateInvoicesAndOverview` | invoices + dashboard overview + patient detail/snapshot (scoped by patientId when known) |
| `invalidateUsersAndAuth` | users + auth/me |
| `invalidateEntityAffectingAppointments` | entity list + appointments (`resource: "patients" \| "categories"`) |
| `invalidateSharingAndAppointments` | invitations + dashboard-access + assignees + appointments |
| `invalidateOrganizations` | organizations |
| `invalidateDashboardOverview` | dashboard overview only |
| `invalidateAllForCrud` | entire `["app"]` tree (logout/session reset) |

---

## Performance & Caching Strategy

### Two-layer caching (client + server)

#### Layer 1 — TanStack Query localStorage persistence (client)

`src/providers/QueryProvider.tsx` wraps the app in `PersistQueryClientProvider` with `createAsyncStoragePersister` (non-deprecated). The entire TQ cache is serialised to `localStorage` under key `cal-appt-query-cache` with 1 000 ms write-throttle.

```tsx
// On hard refresh: localStorage is read synchronously before any network call fires.
// Data renders immediately; TQ background-refetches stale entries per staleTime.
// Cache buster: "v4" — bump when shipping a breaking data-shape change (e.g. availability.dates scopeKey).
persistOptions: { persister, maxAge: 24 * 60 * 60 * 1000, buster: "v4" }
```

Global defaults (`createQueryClient`): `staleTime: 3min`, `gcTime: 10min`, `refetchOnWindowFocus: false`, `refetchOnMount: false`. `useDashboardOverview` overrides to `staleTime: 60s` for fresher KPIs.

Degrades gracefully to plain `QueryClientProvider` when `localStorage` is unavailable (SSR, private browsing).

#### Layer 2 — Redis server-side cache for dashboard overview (`/api/dashboard/overview`)

The overview route aggregates 16+ Prisma queries against a remote VPS Postgres (600ms–2.4s raw). With Redis:

- **Cache key**: `dashboard:overview:<userId>` — per-user, no data leak between accounts.
- **TTL**: 90 seconds.
- **Cache hit**: <5ms — returns serialised JSON directly, skips all Prisma queries.
- **Cache miss**: runs queries, writes result with TTL, returns. Write is fire-and-forget (`void`) to not block the HTTP response.
- **Graceful degradation**: if `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are not set, `redis.isConfigured = false` and the route falls through to normal Prisma queries.

#### Redis cache invalidation — complete route coverage

`redis.invalidateDashboardOverview(userId)` is called (fire-and-forget) after every successful mutation that changes data tracked in the overview:

| Route | Method | Triggers invalidation because... |
|---|---|---|
| `POST /api/appointments` | create | appointment counts change |
| `PUT /api/appointments/[id]` | update | status/date change affects counts |
| `PATCH /api/appointments/[id]` | patch | status/date change affects counts |
| `DELETE /api/appointments/[id]` | delete | appointment counts change |
| `POST /api/appointments/import-ics` | bulk import | appointment counts change |
| `POST /api/calendar/import` | ICS file import | appointment counts change |
| `POST /api/invoices` | create | revenue totals change |
| `PATCH /api/invoices/[id]` | update status | paid/outstanding split changes |
| `DELETE /api/invoices/[id]` | delete | revenue totals change |
| `POST /api/payments/webhook` | Stripe paid event | revenue totals change; `user_id` resolved from invoice record (no session in webhook) |
| `POST /api/patients` | create | total patient count changes |
| `PUT /api/patients/[id]` | update | active patient count may change |
| `DELETE /api/patients/[id]` | delete | total patient count changes |
| `POST /api/categories` | create | total category count changes |
| `PUT /api/categories/[id]` | update | category record changes |
| `DELETE /api/categories/[id]` | delete | total category count changes |
| `PATCH /api/users/[id]` | role change | doctor count (`role = "doctor"`) changes |

All other routes confirmed **not needed**: they either read-only, or write to tables not tracked in the overview (`notifications`, `assignees`, `organisations`, `invitations`, `dashboard-access`, `google-calendar-tokens`, etc.).

---

## Key Flows

### Login / Demo Login

```bash
POST /api/auth/login (or /api/auth/demo)
    → verifyPassword (bcrypt)
    → generateToken (jsonwebtoken, 7d)
    → setSession(token) — sets httpOnly cookie
    → return { user }
Client:
    queryClient.setQueryData(queryKeys.auth.me, user)  ← seeds cache immediately
    router.push("/dashboard")
    AuthShell renders dashboard layout (no loading flash)
    Middleware verifies cookie on /dashboard RSC fetch ✓
```

### Logout

```bash
POST /api/auth/logout → clearSession() → 200
Client (useAuth.logoutMutation.onSuccess):
    window.location.href = "/login"   ← full reload clears all client state
```

### Protected Route Navigation

```bash
User clicks link → router.push("/some-protected-route")
    → Next.js fetches RSC for that route
    → middleware runs (edge, <1ms), verifies JWT
    → if invalid → redirect /login (no HTML returned, no flash)
    → if valid → page renders, AuthShell renders dashboard chrome
```

---

## Landing Page (LandingPage.tsx)

| Feature | Implementation |
|---|---|
| Full-viewport rotating hero bg | `HeroBackground` — two `div.hero-bg-layer` + CSS Ken Burns `hero-bg-kenburns-cycle` (14 s) |
| Appointment deck | `AppointmentDeck` — framer-motion `popLayout`, 6 appointments cycling every 3.4 s |
| Card doctor bg | `div.card-bg-layer` + CSS Ken Burns `card-bg-kenburns` (8 s) — independent keyframe |
| Typewriter status bar | `useTypewriter` hook — types/deletes 4 status messages in sequence |
| Demo login button | calls `/api/auth/demo` → seeds React Query cache → `router.push("/dashboard")` |
| Scroll-triggered animations | Framer Motion `whileInView` with `once: false` |
| Fixed navbar | `<header class="fixed z-50">` |
| Z-index stack | Hero bg `z:0`, overlays `z:1`, sections `z:10`, navbar `z:50` |

---

## Prisma Schema (prisma/schema.prisma)

Core models: User, Appointment, Doctor, Patient, Category, Invitation, Organization, OrganizationMember, Invoice, Notification, DoctorAvailability, DoctorTimeOff, AppointmentType.

All models use UUID primary keys (`@default(uuid())`), have `createdAt`/`updatedAt` timestamps, and are joined by foreign keys with explicit `@relation` names for clarity.

---

## Proxy Matcher (critical — what is and isn't processed)

```bash
matcher: "/((?!_next|api|images|doctors|favicon|.*\\.\\w+$).*)"

INCLUDED (proxy runs):   /, /login, /register, /dashboard, /control-panel/*, /analytics, ...
EXCLUDED (pass-through): /_next/*, /api/*, /images/*, /doctors/*, /favicon.*, *.ico, *.jpg, *.avif …
```

Static assets and API routes bypass the proxy entirely at the matcher level.
This is what prevents the redirect-loop bug (asset requests going to /login).

---

## Cache Strategy

| Route type | Browser `Cache-Control` | Vercel CDN |
|---|---|---|
| `/_next/static/*` | `public, max-age=31536000, immutable` | same (1 yr) |
| `/_next/image` | `public, max-age=86400, stale-while-revalidate=604800` | same |
| Static assets (images/fonts) | `public, max-age=31536000, immutable` | same |
| `/api/*` | `no-store, no-cache` | not cached |
| `/login`, `/register` | `no-store` | not cached |
| Protected pages | `private, no-cache, must-revalidate` | not cached |
| Landing `/` | `public, max-age=60, stale-while-revalidate=300` | 60 s SWR |

Set by `proxy.ts` on every response. CDN headers use both `CDN-Cache-Control` and `Vercel-CDN-Cache-Control`.

---

## Rate Limiting (src/lib/constants.ts)

| Endpoint | Limit |
|---|---|
| Login | 10 req / min |
| Register | 5 req / min |
| Password reset | 5 req / min |
| API general | 100 req / min |
| Demo login | no limit |

---

## Latest UX Reliability Layer (Global Shared)

### Shared Notification System

- New reusable notification utility: `src/lib/notify.tsx`
- Rich Sonner payloads now support semantic variant styling, left icon, title, subtitle, and operation-level helpers.
- Added semantic helpers:
  - `notify.loginWelcome({ name, todayCount })`
  - `notify.logoutGoodbye({ name })`
  - `notify.crud({ action, entity, detail })`
- Dynamic `detail` builders: `src/lib/crud-notify-messages.ts` (schedule panels, visit types, booking, invoices, orgs, notifications — see doctor-portal + Notification System in CLAUDE.md).
- `src/lib/api-client.ts` now routes generic API errors through `notify.error(...)`.

### Shared Sensitive-Action Dialog

- `src/components/shared/ConfirmActionDialog.tsx` — shadcn `AlertDialog`; variants `destructive` | `warning` | `info`; rose/amber/sky media + violet cancel + glow confirm.
- Dynamic copy: `src/lib/confirm-delete-dialog-copy.tsx` (invoice delete, owned-type delete/disable, global-type disable, weekly window delete, time-off delete).
- Wired: calendar, navbar, doctor portal, CP category/patient/doctor deletes, **`GlobalAppointmentTypesEditor`**, **`OrganizationManagement`**, **`AppointmentsManagement`**, **`AppointmentDetailForm`**, **`NotificationsManagement`** (mark all read, `info`), **`GoogleCalendarSettings`** (disconnect, `warning`), **`DoctorDetailForm`** (reset, `warning`). Copy in `confirm-delete-dialog-copy.tsx`. Dropdown/dialog: controlled `open` + sibling of `DropdownMenu` where applicable.

### Typed Validation Foundation (Zod)

- New shared schema modules under `src/lib/schemas/`:
  - `common.ts`
  - `auth.ts`
  - `appointment.ts`
  - `upload.ts`
  - `patient.ts`
  - `parse.ts` (API-friendly zod error response helpers)
- Global upload guard updated to **1MB max** via schema + constants alignment.

### Core API Boundary Validation (Implemented)

- `src/app/api/auth/login/route.ts` now validates request payload with `loginRequestSchema`.
- `src/app/api/auth/register/route.ts` now validates request payload with `registerRequestSchema`.
- `src/app/api/appointments/route.ts` POST now validates create payload with `appointmentCreateSchema`.
- `src/app/api/appointments/import-ics/route.ts` now validates .ics content with `appointmentIcsImportSchema` (1MB limit).
- `src/app/api/storage/upload/route.ts` now validates upload metadata/size with `uploadMetaSchema`.
- `src/app/api/calendar/import/route.ts` now validates uploaded file metadata and enforces `.ics` extension.

### Frontend Validation + Messaging Rollout (Current)

- Auth forms now use zod client-side pre-validation and inline field error states:
  - `src/components/login/Login.tsx`
  - `src/components/register/Register.tsx`
- Calendar import dialog now validates file type/size/content before submit:
  - `src/components/calendar/ImportICSDialog.tsx`
- Appointment dialog now applies schema validation before mutation submit:
  - `src/components/calendar/AppointmentDialog.tsx`
- Patient portal booking flow now validates date-time/title using appointment schema:
  - `src/components/pages/PatientPortalPage.tsx`

### Hook-Level CRUD Notification Standardization

- CRUD hooks migrated from generic `toast.success(...)` to semantic `notify.*(...)` messaging:
  - `src/hooks/useAppointments.ts`
  - `src/hooks/useCategories.ts`
  - `src/hooks/usePatients.ts`
  - `src/hooks/useOrganization.ts`
  - `src/hooks/useUsers.ts`
  - `src/hooks/useInvitations.ts`
  - `src/hooks/useNotifications.ts`
  - `src/hooks/useGoogleCalendar.ts`
  - `src/hooks/usePayments.ts`
  - `src/hooks/useAuth.ts` (logout goodbye messaging)

---

## Database reset & demo workflow

Recommended order when wiping app data for clean QA:

1. `CONFIRM_DB_CLEAR=YES npm run db:clear` — truncates all `public` tables (keeps `_prisma_migrations`).
2. `npx prisma db push` — only if schema drift; normally handled by `npm run build`.
3. `npm run db:seed-test-user` — creates/updates demo users and seeds doctor availability + default appointment type.
4. `npm run db:check-users` — lists users and verifies demo emails exist.
5. With dev server running: `npm run test:smoke-invalidation` (uses `test@admin.com` via `/api/auth/demo`).

Shared demo credentials live in `src/lib/demo-credentials.ts` (`test@admin.com`, `test@doctor.com`, `test@patient.com` + 7 extra doctors, password `12345678`).

---

## Shared scheduling UX (cal.com-style)

- **Lib (single source):** `src/lib/scheduling/availability-slot-grid.ts` — `buildDaySlotCells`, `getBookableDatesInMonth`, `computeDaySlotGrid`; `src/lib/availability-slots.ts` wraps legacy `{ slots[] }` + `{ cells[] }`. Tests: `src/lib/__tests__/scheduling/availability-slot-grid.test.ts`.
- **Validation:** `src/lib/scheduling/validate-appointment-window.ts` — `assertSlotAvailableForBooking`, `assertNoOwnerAppointmentOverlap` (409).
- **API:**
  - `GET /api/availability/dates?doctorId&typeId|flexDurationMinutes&month=YYYY-MM` → month map (`availability-api-query.ts`)
  - `GET /api/availability/slots?doctorId&date&typeId` → `{ slots, cells, timezone }`
- **Scope:** `SchedulingScopeKey` + `flexible-type-config.ts` for doctors without bookable types.
- **Query keys:** `dates(doctorId, scopeKey, monthYm)`; bust via `availability.root` invalidation helpers.
- **Prefetch:** `prefetchSchedulingMonthWithAdjacent` + `prefetchSchedulingMonthsAdjacent` on calendar month change.
- **UI:** `VisitTypePickerList` (patient re-export `PatientBookingTypePickerList`); `SchedulingPanel` `layout="split"` (calendar + slot rail side-by-side on `sm+`; flex = calendar + hint in rail).
- **Staff:** `useBookableTypesForDoctor` + `VisitTypePickerList`; `isStaffFlexible` + flex duration chips; open prefetch for flex + typed (`types[0]` when `slotPickTypeId` empty).
- **Tests:** `availability-api-query.test.ts`, `scheduling-scope.test.ts`, `availability-routes.test.ts`, `availability-slot-grid.test.ts`.
- **Persist buster:** `v4` in `QueryProvider.tsx`.

## Cal-style availability (legacy note)

- **Models** (`prisma/schema.prisma`): `DoctorAvailability`, `DoctorTimeOff`, `AppointmentType` (duration, buffers, slot step, minimum notice).
- **RBAC:** `users.role === 'patient'` cannot POST/PUT/PATCH/DELETE dashboard appointments or POST organizations.

---

## Black Flash Bug Fix

**Root cause:** `html { background: #0f172a }` + `body { background: #020617 }` in globals.css. The control-panel right pane in `layout.tsx` had no background — during the hydration frame where `TabsContent` is active but empty, the dark body bleeds through.

**Fix:** `app/control-panel/layout.tsx` outer `<div>` has `bg-gradient-to-br from-slate-50 via-white to-slate-100` — mirrors `AuthShell`'s gradient so dark background cannot show through during hydration.

---

## Security Header Architecture (current state)

### Single source of truth: `src/proxy.ts`

`Content-Security-Policy` and `X-Frame-Options` are set **only** in the edge proxy, never in `src/lib/security-headers.ts`. This prevents conflicting duplicate headers that browsers resolve in the most restrictive direction.

`src/lib/security-headers.ts` (applied via `next.config.ts` to all routes) contains only:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`

### Per-route framing policy (proxy.ts)

| Route type | CSP `frame-ancestors` | `X-Frame-Options` |
|---|---|---|
| Public pages (`/`, `/login`, `/register`, `/accept-invitation`) | `'self' https://vercel.com https://vercel.live https://*.vercel.app https://*.vercel-insights.com` | **not set** — see note below |
| Protected pages (`/dashboard`, `/control-panel/*`, etc.) | `'none'` | `DENY` |

**Why `X-Frame-Options` is omitted for public pages:**
`SAMEORIGIN` would block `vercel.com` (a different origin) from embedding the page in its deployment preview iframe even though `frame-ancestors` explicitly allows it, because some renderers check both headers and use the most restrictive. Modern browsers use CSP `frame-ancestors` and ignore `X-Frame-Options` when both are present, but Vercel's preview renderer does not fully follow this precedence. Omitting `X-Frame-Options` on public pages means legacy browsers allow all framing (acceptable for marketing pages) while modern browsers are governed by `frame-ancestors`.

**IMPORTANT:** If you add back `X-Frame-Options` to `security-headers.ts` or set it to `SAMEORIGIN`/`DENY` for public pages in the proxy, the Vercel dashboard deployment preview thumbnail will show "Error: Forbidden" again.

---

## Role-Based Access Control (RBAC) — UI layer

### Navbar (`src/components/navbar/Navbar.tsx`)

| Role | Visible nav items |
|---|---|
| `admin` | Dashboard, Control Panel, Admin Portal, Insights |
| `doctor` | Dashboard, Doctor Portal, Insights (own-scoped) |
| `patient` | Patient Portal only |

`isPatient = role === "patient"`, `isStaff = role === "admin" || role === "doctor"`. Staff do not see the "Patient Portal" nav link.

### CalendarHeader (`src/components/calendar/CalendarHeader.tsx`)

`PageToolbarChrome` only — no Appointments title/icon (toolbar: date nav, List/Day/Week/Month, `CalendarHeaderRoleActions`). `min-h-[3.5rem]` + `border-b py-2` matches portal chrome band height. Role from `user?.role ?? initialNavRole`. Prefetch: patients `prefetchDoctorsDirectory`; staff `appointmentTypes.byDoctor`. `dashboardShellClass` horizontal inset.

### GlobalSearch (`src/components/shared/GlobalSearch.tsx`)

`useUsers()` query is disabled when `isPatient` is true (prevents `GET /api/users 403`). `usePatients()` runs for all roles; the API scopes results server-side.

---

## API Access — Role-Scoped Endpoints

### `GET /api/appointment-assignees`

`appointment_id` query param is now **optional**:
- With `appointment_id`: returns assignees for that specific appointment (existing access check: must own or be participant).
- Without `appointment_id`: returns all assignee rows for every appointment the caller owns or is an accepted participant on. This is what `fetchAssignees()` calls on page load.

**Previously**: always required `appointment_id` → caused `400 Bad Request` on every calendar page load. All appointment and telehealth queue pages now load correctly.

### `GET /api/users`

Patients are normally forbidden from listing all users. Exception: `?role=doctor` scoped list for legacy UI. **Patient booking** uses `GET /api/doctors` (`useDoctorsDirectory`) — `bookable_appointment_types` (owned + enabled globals, scheduling fields), not `useUsers`.

---

## Demo Account & Landing Page

### Landing page demo dropdown (`src/components/pages/LandingPage.tsx`)

The "Try demo account" button is a split dropdown with three roles (secretary removed):

| Option | Credentials | Redirects to |
|---|---|---|
| Demo Admin | `test@admin.com` / `12345678` | `/dashboard` |
| Demo Doctor | `test@doctor.com` / `12345678` | `/dashboard` |
| Demo Patient | `test@patient.com` / `12345678` | `/patient-portal` |

Uses `POST /api/auth/login` (same endpoint as the login form, no separate `/api/auth/demo` required). After login, seeds the React Query `auth/me` cache and routes by role.

**Note:** The old `/api/auth/demo` endpoint still exists but was returning `403` in production because `ENABLE_DEMO_AUTH` env var was not set. The landing page no longer calls it.

### Register page note (`src/components/register/Register.tsx`)

A short info note below the password field informs new users: "New accounts are created with the Admin role by default. You can change your role later from the Control Panel."

---

## OAuth State Management (`src/lib/oauth-state.ts`)

Stateless, signed JWT used as the `state` parameter for Google OAuth flows (both auth and calendar connect). Replaces ad-hoc cookie/session state. Key fields encoded in the token: `returnTo`, `provider`, `csrfToken`. Verified on callback before exchanging the code.

Relevant routes:
- `src/app/api/auth/google/route.ts` — generates state token, redirects to Google
- `src/app/api/auth/callback/google/route.ts` — verifies state, exchanges code, sets session
- `src/app/api/calendar/connect/route.ts` — generates state for calendar scope
- `src/app/api/calendar/callback/route.ts` — verifies state, stores tokens

---

## Dashboard Layout (`src/app/dashboard/layout.tsx`)

Thin server layout wrapper for the `/dashboard` route. Provides the outer structure for the dashboard page without additional auth checks (handled by proxy). Ensures consistent padding/background for the dashboard route group.

---

## Known Architecture Notes

- **Doctor portal**: `/doctor-portal` — [Weekly \| Global visit types] + [Unavailable \| Additional] `lg:2-col`; `FilterSelect` + fixed navbar; SSR `prefetchDoctorPortalSettings` + owned-type `is_active` manager. `resolveRoleHomeHref` login landing.
- **`/api/auth/demo`**: Endpoint still present but no longer used by the landing page. Can be removed or kept for backwards compatibility.
- **Vercel Deployment Protection**: The project is on the Hobby plan. "Require Log In" Vercel Authentication is toggled OFF so that deployment-specific preview URLs (`*.vercel.app`) load without Vercel login, allowing the Vercel dashboard preview thumbnail to render correctly.
- **`src/lib/rate-limit.ts`**: In-memory rate limiter (resets on cold start). For production-grade rate limiting that survives cold starts, use the Redis-backed approach (`src/lib/redis.ts` + Upstash).
