# Build Manifest — HealthCal Pro

<!-- Cycle: C1+C2+C3 | Last updated: 2026-06-02 -->

## Artifacts

| ART-ID | Cycle | REQ-ID | Path / Description | Status |
|--------|-------|--------|-------------------|--------|
| ART-0001 | C1 | REQ-0001 | `src/lib/entity-active-status.ts` | built |
| ART-0002 | C1 | REQ-0001 | `src/lib/category-dialog-ui-classes.ts` | built |
| ART-0003 | C1 | REQ-0001 | `src/lib/category-form-state.ts` | built |
| ART-0004 | C1 | REQ-0001 | `src/lib/category-management-toolbar-classes.ts` | built |
| ART-0005 | C1 | REQ-0001 | `src/hooks/useCategoryListMetrics.ts` | built |
| ART-0006 | C1 | REQ-0001 | `src/context/CategoryMetricsContext.tsx` | built |
| ART-0007 | C1 | REQ-0001 | `src/components/control-panel/CategoryListFiltersContext.tsx` | built |
| ART-0008 | C1 | REQ-0001 | `src/components/control-panel/CategoryManagementStatsRow.tsx` | built |
| ART-0009 | C1 | REQ-0001 | `src/components/control-panel/category-dialog/*` | built |
| ART-0010 | C1 | REQ-0001 | `src/components/control-panel/CategoryManagement.tsx` | rebuilt |
| ART-0011 | C1 | REQ-0001 | `src/components/control-panel/CategoryDetailScreen.tsx` (CP) | built |
| ART-0012 | C1 | REQ-0001 | `src/components/shared/select/ActiveInactiveSelectSections.tsx` | built |
| ART-0013 | C1 | REQ-0001 | SSR: `[section]/page.tsx`, `ControlPanelPage.tsx`, `categories/[id]/page.tsx` | built |
| ART-0014 | C1 | REQ-0001 | Appointment booking selects (GeneralSection + DetailForm) | built |
| ART-0015 | C1 | REQ-0001 | `src/lib/__tests__/entity-active-status.test.ts` | built |
| ART-0016 | C1 | REQ-0002 | `src/lib/category-snapshot-data.ts`, snapshot API, query keys, hooks | built |
| ART-0017 | C1 | REQ-0002 | `src/lib/category-query-cache.ts`, cache patch in `useCategories.ts` | built |
| ART-0018 | C1 | REQ-0002 | Assignees active/inactive picker + CP category live panel | built |
| ART-0019 | C1 | REQ-0002 | `src/lib/__tests__/category-query-client.test.ts` | built |
| ART-0020 | C1 | REQ-0003 | `src/lib/appointment-mutation-invalidation.ts` | built |
| ART-0021 | C1 | REQ-0003 | Portal live category detail + cross-tab patients/categories | built |
| ART-0022 | C1 | REQ-0003 | Bulk/booking invalidation + stats isFetching pulse | built |
| ART-0023 | C1 | REQ-0004 | `src/lib/appointments-list-build.ts` | built |
| ART-0024 | C1 | REQ-0004 | `prefetchDashboardAppointments`, org/assignees/dashboard-access in `server-prefetch.ts` | built |
| ART-0025 | C1 | REQ-0004 | `src/app/dashboard/page.tsx` + `HomePage.tsx` cache seed | built |
| ART-0026 | C1 | REQ-0004 | CP org prefetch: `[section]/page.tsx`, `ControlPanelPage.tsx` | built |
| ART-0027 | C1 | REQ-0004 | `ControlPanelSsrCacheSeed.tsx` + `control-panel/layout.tsx` + `control-panel-users-filters.ts` | built |
| ART-0028 | C1 | REQ-0004 | `src/lib/appointments-calendar-assignees.ts` + batch `GET /api/appointments?ids=` | built |
| ART-0029 | C1 | REQ-0004 | `fetchAppointmentsByIds` in `query-fetchers.ts`; `useAppointments.ts` batch path | built |
| ART-0030 | C1 | REQ-0004 | `PAGINATION.CALENDAR_*` limits in `constants.ts` | built |
| ART-0031 | C1 | REQ-0004 | `CROSS_TAB_SCOPES.ORGANIZATIONS` + `invalidateOrganizations` publish | built |
| ART-0032 | C1 | REQ-0004 | `src/lib/__tests__/appointments-calendar-assignees.test.ts` | built |
| ART-0033 | C1 | REQ-0004 | `src/lib/__tests__/query-cache-cross-tab.test.ts` (ORGANIZATIONS scope) | built |
| ART-0034 | C2 | REQ-0005 | `migrations/008_user_is_active.sql`, Prisma `User.is_active` | built |
| ART-0035 | C2 | REQ-0005 | `src/lib/doctor-revenue-aggregate.ts`, `GET /api/doctors` revenue | built |
| ART-0036 | C2 | REQ-0005 | `src/lib/doctor-active-booking.ts`, inactive booking UX | built |
| ART-0037 | C2 | REQ-0005 | `ClinicalListFilterToolbar` + `DoctorManagement.tsx` emerald table | built |
| ART-0038 | C2 | REQ-0005 | `DoctorDetailScreen.tsx`, `DoctorFormDialog.tsx` | built |
| ART-0039 | C2 | REQ-0005 | Services/booking inactive badges + directory partition | built |
| ART-0040 | C2 | REQ-0006 | `GET /api/doctors/[id]/assigned-patients` + `useDoctorAssignedPatients` | built |
| ART-0041 | C2 | REQ-0006 | `invalidateDoctorAssignedPatients` in `query-client.ts` | built |
| ART-0042 | C2 | REQ-0006 | `AdminUserDetailScreen.tsx`, `AdminUserFormDialog.tsx` | built |
| ART-0043 | C2 | REQ-0006 | CP user/doctor detail SSR + doctor redirect on `/users/[id]` | built |
| ART-0044 | C2 | REQ-0007 | `CP_ADMIN_USERS_FILTERS`, `UserManagement.tsx` admin-only | built |
| ART-0045 | C2 | REQ-0007 | `query-cache-cross-tab.ts` ENTITY_PATIENTS + `doctors` | built |
| ART-0046 | C2 | REQ-0008 | `src/lib/cp-dev-stub-copy.ts` | built |
| ART-0047 | C2 | REQ-0008 | `CpDevStubSubmitNote`, `CpListPaginationDevStub` | built |
| ART-0048 | C2 | REQ-0008 | Doctor/UserManagement stubs + `ConfirmActionDialog.confirmDisabled` | built |
| ART-0049 | C3 | REQ-0009 | `src/lib/staff-appointment-calendar-scope.ts` | built |
| ART-0050 | C3 | REQ-0009 | `src/app/api/appointments/route.ts` scope + portal/dashboard wiring | built |
| ART-0051 | C3 | REQ-0009 | `scripts/seed-demo-appointments-curated.ts`, `db:seed-demo-appointments` | built |
| ART-0052 | C3 | REQ-0009 | `src/lib/__tests__/staff-appointment-calendar-scope.test.ts` | built |
| ART-0053 | C3 | REQ-0009 | `src/lib/login-today-appointments.ts` scoped counts | built |
| ART-0054 | C3 | REQ-0009 | `src/lib/server-prefetch.ts` doctor portal scoped prefetch | built |
| ART-0055 | C3 | REQ-0010 | `src/lib/calendar-clinical-role-filter.ts` | built |
| ART-0056 | C3 | REQ-0010 | `CategoryFilterSelect.tsx`, `PatientFilterSelect.tsx` | built |
| ART-0057 | C3 | REQ-0010 | `CalendarFiltersContext` + `CalendarFiltersEmptyState` | built |
| ART-0058 | C3 | REQ-0010 | `src/components/calendar/Filters.tsx` toolbar integration | built |
| ART-0059 | C3 | REQ-0010 | `src/lib/__tests__/calendar-clinical-role-filter.test.ts` | built |
| ART-0060 | C3 | REQ-0010 | `src/lib/__tests__/calendar-filters-empty-state.test.tsx` | built |
| ART-0061 | C3 | REQ-0011 | `src/lib/invoice-billing-totals.ts` | built |
| ART-0062 | C3 | REQ-0011 | `InvoiceBillingStatsRow.tsx`, `InvoiceBillingListRow.tsx` | built |
| ART-0063 | C3 | REQ-0011 | `InvoiceManagement.tsx` KPI + outstanding fix | built |
| ART-0064 | C3 | REQ-0011 | `OrganizationBillingPanel.tsx` full list + KPI | built |
| ART-0065 | C3 | REQ-0011 | `queryKeys.invoices.byOrganization` + `byOrganizationTotals` | built |
| ART-0066 | C3 | REQ-0011 | `src/lib/__tests__/invoice-billing-totals.test.ts` | built |
| ART-0067 | C3 | REQ-0012 | `org-billing-prefetch.ts`, `control-panel-section-prefetch.ts` | built |
| ART-0068 | C3 | REQ-0012 | `ClinicalTableEmptyDash.tsx`, `clinical-empty-dash.test.tsx` | built |
| ART-0069 | C3 | REQ-0011 | `src/app/api/invoices/billing-totals/route.ts` | built |
| ART-0070 | C3 | REQ-0012 | `prefetchInvoiceBillingTotalsForOrganization` in `server-prefetch.ts` | built |
| ART-0071 | C3 | REQ-0013 | `staff-appointment-calendar-scope.ts` assignee OR clauses | built |
| ART-0072 | C3 | REQ-0013 | `calendar/export`, `calendar/sync`, `appointments/search` scope | built |
| ART-0073 | C3 | REQ-0013 | `login-today-appointments.ts` + tests | built |
| ART-0074 | C3 | REQ-0013 | SSR prefetch scope in `server-prefetch.ts`, `control-panel-section-prefetch.ts` | built |
| ART-0075 | C3 | REQ-0014 | `fetchTelehealthShareForPeriod` in `insights-aggregate.ts` | built |
| ART-0076 | C3 | REQ-0014 | `insights-data.ts` period telehealth wiring | built |
| ART-0077 | C3 | REQ-0014 | `insights-period-charts.test.ts` telehealth tests | built |
| ART-0078 | C3 | REQ-0015 | `InvoiceRevenueKpiGrid.tsx`, `invoice-revenue-kpi-presets.ts` | built |
| ART-0079 | C3 | REQ-0015 | `insights-paid-collected.ts`, `invoice-paid-period.ts` | built |
| ART-0080 | C3 | REQ-0015 | `invoice-billing-totals.ts` extended buckets + `computeInvoiceExtendedKpis` | built |
| ART-0081 | C3 | REQ-0015 | `fetchRevenueAggregates` statusTotals + `billing-totals/route.ts` | built |
| ART-0082 | C3 | REQ-0015 | `AnalyticsRevenueStatsRow.tsx`, `AnalyticsOverviewStatsRow.tsx` hints | built |
| ART-0083 | C3 | REQ-0015 | `insights-kpi-format.ts` `formatBillingKpiMoney` | built |
| ART-0084 | C3 | REQ-0015 | `InvoiceManagement.tsx`, `OrganizationBillingPanel.tsx` KPI grid | built |
| ART-0085 | C3 | REQ-0015 | `invoice-paid-period.test.ts`, extended billing-total tests | built |
| ART-0086 | C4 | REQ-0016 | `billing-visit-fee.ts` `DEFAULT_DOCTOR_VISIT_FEE_CENTS` + `appointment-visit-fee-display.ts` | built |
| ART-0087 | C4 | REQ-0016 | `billing-appointment-options-load.ts` suggested fee; options-load tests | built |
| ART-0088 | C4 | REQ-0016 | `invoice-status-display.ts`; `InvoiceAmountDisplay` status tint | built |
| ART-0089 | C4 | REQ-0016 | `InvoiceListFiltersContext.tsx`, `invoice-management-columns.tsx`, `invoice-table-cells.tsx` | built |
| ART-0090 | C4 | REQ-0016 | `InvoiceManagement.tsx` DataTable + `ClinicalListFilterToolbar` amber frame | built |
| ART-0091 | C4 | REQ-0016 | `invoice-management-toolbar-classes.ts`; `invoice-dialog-ui-classes.ts` amber picker | built |
| ART-0092 | C4 | REQ-0016 | `InvoiceVisitDirectoryPickerCard.tsx`; `StaffAppointmentPickerField` tone amber | built |
| ART-0093 | C4 | REQ-0016 | `InvoiceAppointmentPickerField.tsx` + `InvoiceDialogFieldsSection` fee hint | built |
| ART-0094 | C4 | REQ-0017 | `invoice-detail-ui-classes.ts`; `InvoiceDetailLiveBody` glass + audit card | built |
| ART-0095 | C4 | REQ-0017 | `InvoiceLinkedVisitPanel.tsx` patient/doctor sky links | built |
| ART-0096 | C4 | REQ-0016 | `scripts/lib/doctor-profile-seed-data.ts`; seed-test-user + seed-extended import | built |
| ART-0097 | C4 | REQ-0016 | `AppointmentDialogGeneralSection.tsx` office_location prefill on doctor select | built |
| ART-0098 | C4 | REQ-0016 | `ui/popover.tsx`, `ClinicalGlassDatePicker.tsx`, invoice + patient due/birth date | built |
| ART-0099 | C4 | REQ-0016 | `DoctorPortalInvoiceListRow` reuses `invoice-table-cells` | built |
| ART-0100 | C4 | REQ-0016 | `invoice-management-columns.test.ts`; seed `db:seed-demo-full` / `db:seed-doctor-profiles` | built |
| ART-0101 | C5 | REQ-0021 | `EntityDetailRecordAuditCard.tsx`, `EntityDetailAuditActorInline.tsx` | built |
| ART-0102 | C5 | REQ-0021 | `entity-detail-audit-actor.ts` + `entity-detail-audit-actor.test.ts` | built |
| ART-0103 | C5 | REQ-0021 | `PatientDetailScreen.tsx` Record Audit wiring | built |
| ART-0104 | C5 | REQ-0021 | `CategoryDetailScreenShared.tsx` Record Audit wiring | built |
| ART-0105 | C5 | REQ-0021 | `DoctorDetailScreenShared.tsx` + `mapUserRecordAuditActors` | built |
| ART-0106 | C5 | REQ-0021 | `AppointmentDetailScreenShared.tsx` audit + visit overview | built |
| ART-0107 | C5 | REQ-0021 | `appointment-detail-view-model.ts` audit actors | built |
| ART-0108 | C5 | REQ-0021 | `appointment-detail-view-model.test.ts` | built |
| ART-0109 | C5 | REQ-0022 | `migrations/013_appointment_audit_users.sql`, Prisma `20260604180000` | built |
| ART-0110 | C5 | REQ-0022 | `migrations/014_category_audit_backfill.sql` | built |
| ART-0111 | C5 | REQ-0022 | `migrations/015_user_audit_users.sql`, Prisma `20260604190000` | built |
| ART-0112 | C5 | REQ-0022 | `patient-api-include.ts`, `category-api-include.ts`, `user-api-include.ts` | built |
| ART-0113 | C5 | REQ-0022 | `serializers.ts` denormalized audit fields; `types/types.ts` | built |
| ART-0114 | C5 | REQ-0022 | API `updated_by_id` on appointments/patients/categories/users PATCH | built |
| ART-0115 | C5 | REQ-0023 | `appointment-detail-invoice-audit-rows.tsx` | built |
| ART-0116 | C5 | REQ-0023 | `invoice-visit-summary.ts` issuer_email/issuer_role | built |
| ART-0117 | C5 | REQ-0023 | `formatAppointmentDetailWhenRange` subtitle | built |
| ART-0118 | C5 | REQ-0023 | `entity-detail-snapshot-section-copy.ts` section titles | built |
| ART-0119 | C5 | REQ-0024 | `AdminUserDetailScreen.tsx` Record Audit | built |
| ART-0120 | C5 | REQ-0024 | `control-panel/users/[id]/page.tsx` `userDetailInclude` SSR | built |
| ART-0121 | C5 | REQ-0024 | `useUsers.ts` detail `initialData` + `setQueryData` on PATCH | built |
| ART-0122 | C5 | REQ-0024 | `GET/PATCH /api/users/[id]` include audit actors | built |
| ART-0123 | C5 | REQ-0025 | `scripts/backfill-user-audit.ts`, `db:backfill-user-audit` | built |
| ART-0124 | C5 | REQ-0025 | `seed-test-user.ts` audit stamp + `updateMany` backfill | built |
| ART-0125 | C5 | REQ-0026 | `user-api-select.ts` list scalars only (documented constraint) | built |
| ART-0126 | C6 | REQ-0027 | `VisitFeeBadge.tsx`, `visit-fee-badge-ui-classes.ts` | built |
| ART-0127 | C6 | REQ-0027 | `resolveBookingVisitFeeDisplay`; booking wizard badge | built |
| ART-0128 | C6 | REQ-0027 | `AppointmentListVisitFeeBadge`; card meta integration | built |
| ART-0129 | C6 | REQ-0027 | `VisitTypePickerList`; services page fee display | built |
| ART-0130 | C6 | REQ-0027 | Visit fee badge tests + surface parity | built |
| ART-0131 | C6 | REQ-0028 | `invoice-detail-ui-classes.ts` violet + shadows | built |
| ART-0132 | C6 | REQ-0028 | `InvoiceDetailHeaderActions.tsx` Generate/Download | built |
| ART-0133 | C6 | REQ-0028 | `invoice-pdf-document.ts`, `api/invoices/[id]/pdf/route.ts` | built |
| ART-0134 | C6 | REQ-0028 | `invoice-detail-action-capabilities.ts` footer dedupe | built |
| ART-0135 | C6 | REQ-0028 | `InvoiceLinkedVisitPanel.tsx` badge alignment | built |
| ART-0136 | C6 | REQ-0029 | `invoice-dialog-ui-classes.ts` violet migration | built |
| ART-0137 | C6 | REQ-0029 | `EntityDetailChromeHeader.tsx`; CP patient chrome | built |
| ART-0138 | C6 | REQ-0029 | `clinical-identity-inline-ui.ts` identity row alignment | built |
| ART-0139 | C6 | REQ-0030 | `appointment-visit-location.ts` shared resolver | built |
| ART-0140 | C6 | REQ-0030 | `AppointmentVisitScheduleMeta.tsx` | built |
| ART-0141 | C6 | REQ-0030 | `portal-appointment-prisma-include.ts`; patient-portal POST location | built |
| ART-0142 | C6 | REQ-0030 | `AppointmentCard`, timeline, detail, booking summary | built |
| ART-0143 | C6 | REQ-0031 | `doctorPortalAppointmentListInclude`; `mapDoctorPortalAppointmentsFromRows` | built |
| ART-0144 | C6 | REQ-0031 | `DoctorPortalAppointmentListRow.tsx` resolver | built |
| ART-0145 | C6 | REQ-0031 | `dashboard-overview-queue.ts` office embed + queue row | built |
| ART-0146 | C6 | REQ-0031 | `appointment-snapshot-row.ts` office embed | built |
| ART-0147 | C6 | REQ-0031 | `resolveSnapshotAppointmentDisplayLocation` | built |
| ART-0148 | C6 | REQ-0031 | `patient-detail-snapshot-columns.tsx` Location column | built |
| ART-0149 | C6 | REQ-0031 | `appointment-visit-location.test.ts` | built |
| ART-0150 | C6 | REQ-0030..0031 | `server-prefetch.ts` + doctor-portal route sync | built |
| ART-0151 | C6 | REQ-0031 | `DoctorPortalAppointmentRow` type | built |
| ART-0152 | C6 | REQ-0031 | `DashboardQueueAppointmentRow` display location | built |
| ART-0153 | C6 | REQ-0028 | `invalidateAfterInvoiceWrite` on Generate | built |
| ART-0154 | C6 | REQ-0030 | `invalidateAfterAppointmentMutation` booking | built |
| ART-0155 | C6 | REQ-0031 | Constraint: PDF HTML attachment (native PDF deferred) | built |
| ART-0156 | C6 | REQ-0032 | `resolveInvoiceDetailHeaderTitle`; demo slug filter | built |
| ART-0157 | C6 | REQ-0032 | `InvoiceDetailLiveBody` plain header + section title | built |
| ART-0158 | C6 | REQ-0032 | `payment-status-display.ts` + `PaymentStatusBadge.tsx` | built |
| ART-0159 | C6 | REQ-0032 | `invoice-payment-history-columns` glass + reference labels | built |
| ART-0160 | C6 | REQ-0032 | `InvoiceStatusBadge` icons | built |
| ART-0161 | C6 | REQ-0032 | `entityDetailInvoiceRecordSectionTitle` | built |
| ART-0162 | C6 | REQ-0032 | Tests payment-status-display + invoice-list-row-display | built |
| ART-0163 | C6 | REQ-0033 | `badge.tsx` + `calendar-glass-badge` font-normal | built |
| ART-0164 | C6 | REQ-0033 | `entity-id-display.ts` + `copy-to-clipboard.ts` | built |
| ART-0165 | C6 | REQ-0033 | `useCopyToClipboard` + `EntityIdCopyInline` | built |
| ART-0166 | C6 | REQ-0033 | Detail pages + payment history ID copy wiring | built |
| ART-0167 | C6 | REQ-0033 | Badge component sweep (remove font-medium overrides) | built |
| ART-0168 | C6 | REQ-0033 | Tests entity-id-display + copy-to-clipboard | built |
| ART-0169 | C7 | REQ-0034 | `service-catalog-visual.ts`, `AppointmentTypeBrandMark` | built |
| ART-0170 | C7 | REQ-0034 | `ServicesCatalogTypeSelect`, `filterServiceCatalog` | built |
| ART-0171 | C7 | REQ-0034 | Prisma icon/color; appointment-types API + prefetch | built |
| ART-0172 | C7 | REQ-0034 | `ServiceCatalogCard` per-hue glow | built |
| ART-0173 | C7 | REQ-0034 | `invalidateAppointmentTypeDerived` catalog bust | built |
| ART-0174 | C7 | REQ-0034 | Commit `dcd4374` | built |
| ART-0175 | C7 | REQ-0035 | Migration `20260607140000_appointment_cancel_reminder` | built |
| ART-0176 | C7 | REQ-0035 | `appointment-cancel-access.ts` + tests | built |
| ART-0177 | C7 | REQ-0035 | `appointment-id-write.ts` + tests | built |
| ART-0178 | C7 | REQ-0035 | `appointment-notify.ts` + tests | built |
| ART-0179 | C7 | REQ-0035 | `AppointmentStatusGlassBadge` + `appointment-status-display.ts` | built |
| ART-0180 | C7 | REQ-0035 | `AppointmentActionsMenu` cancel; `AppointmentsManagement` | built |
| ART-0181 | C7 | REQ-0035 | Scheduling excludes cancelled (availability + overlap) | built |
| ART-0182 | C7 | REQ-0035 | `useAppointments.cancelAppointment` | built |
| ART-0183 | C7 | REQ-0036 | `cron-reminder-candidates.ts` + tests | built |
| ART-0184 | C7 | REQ-0036 | `cron/reminders/route.ts` refactor | built |
| ART-0185 | C7 | REQ-0036 | `brevo-sms.ts` optional transactional SMS | built |
| ART-0186 | C7 | REQ-0036 | `reminder-recipient-phone.ts` + tests | built |
| ART-0187 | C7 | REQ-0036 | `.env.example` Brevo SMS docs | built |
| ART-0188 | C7 | REQ-0037 | Migration `20260608120000_patient_phone` | built |
| ART-0189 | C7 | REQ-0037 | `phone-validation.ts` + Zod + API POST/PUT | built |
| ART-0190 | C7 | REQ-0037 | `PatientFormDialog` + `patient-form-clinical` phone | built |
| ART-0191 | C7 | REQ-0037 | `PatientManagement` Phone column + search | built |
| ART-0192 | C7 | REQ-0037 | `scripts/seed-phone-backfill.ts`, `db:seed-phones` | built |
| ART-0193 | C4 ext | REQ-0016 | Migration `016_invoice_lifecycle_timestamps` | built |
| ART-0194 | C4 ext | REQ-0016 | `invoice-dialog-visit-display.ts` + visit cards | built |
| ART-0195 | C4 ext | REQ-0016 | `buildInvoiceVisitFeeStripLine` + fee hints | built |
| ART-0196 | C4 ext | REQ-0017 | `invoice-list-meta-status-dates.ts` footer dates | built |
| ART-0197 | C4 ext | REQ-0017 | SSR/GET/prefetch `serializeInvoice` lifecycle TS | built |
| ART-0198 | C4 ext | REQ-0018 | `doctorCanMutateInvoice` + portal `viewerUserId` | built |
| ART-0199 | C4 ext | REQ-0017 | `InvoiceVisitDescriptionStack` Patient/Treating/Owner | built |
| ART-0200 | C4 ext | REQ-0017 | PDF route `refunded_at` + payment history date | built |
| ART-0201 | C4 ext | REQ-0016..0018 | Commits `0194566`..`d2a4cd5` | built |
| ART-0202 | C8 | REQ-0038 | `AppPageChrome.tsx` + `page-chrome-classes` tones | built |
| ART-0203 | C8 | REQ-0038 | `control-panel-page-chrome-config.ts` | built |
| ART-0204 | C8 | REQ-0038 | `ControlPanelPageChrome.tsx` — 14 CP tabs | built |
| ART-0205 | C8 | REQ-0038 | `PageHeader` / `PortalChromeHeader` delegates | built |
| ART-0209 | C8 | REQ-0039 | `ControlPanelSectionChromeServer` + flash fix | built |
| ART-0210 | C8 | REQ-0039 | Invitation tab prefetch | built |
| ART-0212 | C8 | REQ-0040 | `AdminPortalPage` redesign | built |
| ART-0213 | C8 | REQ-0040 | `OrganizationDetailScreen` + indigo glass card + members ClinicalDataTable | built |
| ART-0314 | C18 | REQ-0064 | `organization-list-enrich.ts` enriched org list API/SSR | built |
| ART-0315 | C18 | REQ-0064 | `OrganizationManagement` indigo shell + DataTable + filters/stats | built |
| ART-0316 | C18 | REQ-0064 | `OrganizationBillingPanelCompact` + `InvoicePortalListCard` | built |
| ART-0317 | C18 | REQ-0065 | `OrganizationBillingPanelFull` doctor-portal billing parity | built |
| ART-0318 | C18 | REQ-0065 | `OrganizationFormDialog` + `OrganizationAddMemberDialog` indigo glass | built |
| ART-0319 | C18 | REQ-0065 | `OrganizationDetailScreen` billing + edit/delete/remove member | built |
| ART-0320 | C18 | REQ-0065 | `invalidateOrganizationDetail` + invoice org-scoped bust | built |
| ART-0321 | C18 | REQ-0064 | `organization-management-columns.tsx` + entity detail links | built |
| ART-0322 | C18 | REQ-0064 | `useOrganizationListMetrics` + `OrganizationMetricsContext` | built |
| ART-0323 | C18 | REQ-0064..0065 | Detail page SSR billing prefetch + seed | built |
| ART-0324 | C18 | REQ-0064..0065 | Tests: enrich, routes, metrics, columns | built |
| ART-0325 | C18 | REQ-0064..0065 | Verify **948/948** tsc lint build PASS | built |
| ART-0326 | C19 | REQ-0064 | `indigoGlassTableFrameClass`; org list columns polish | built |
| ART-0327 | C19.1 | REQ-0064 | Detail members `UserRoleBadge`; `db:seed-org-portal-patient-member` | built |
| ART-0328 | C20 | REQ-0065 | `PortalPanelSection` org billing; portal invoice card density | built |
| ART-0329 | C21 | REQ-0065 | `organization-dialog/*`; `initialMembers` API; picker clear/reset | built |
| ART-0330 | C22 | REQ-0065 | Org audit schema + `backfill-organization-audit.ts` | built |
| ART-0331 | C22 | REQ-0065 | `organization-detail-load` enriched members + owner actor | built |
| ART-0332 | C22 | REQ-0065 | `OrganizationDetailScreen` Record Audit + members table parity | built |
| ART-0333 | C22 | REQ-0065 | `OrganizationMemberRowActions` + `OrganizationDetailMembersSectionHeading` | built |
| ART-0334 | C22 | REQ-0065 | `mapOrganizationRecordAuditActors`; `organization-detail-display.ts` | built |
| ART-0335 | C22 | REQ-0065 | Verify **975/975** tsc lint build PASS | built |
| ART-0336 | C23 | REQ-0066 | `organization-members-display.ts` + role count inline row | built |
| ART-0337 | C23 | REQ-0066 | `OrganizationDetailMembersSectionHeading` PortalPanelSubsectionHeader | built |
| ART-0338 | C23 | REQ-0066 | `StaffUserIdentityCell` + members column identity parity | built |
| ART-0339 | C23 | REQ-0066 | `PatientIdentityCell` table badges below email | built |
| ART-0340 | C23 | REQ-0066 | Doctor tab `doctorUsers` section prefetch + seed | built |
| ART-0341 | C23 | REQ-0066 | CP doctor detail assigned patients stacked header | built |
| ART-0342 | C23 | REQ-0066 | Tests: members display, role count row, identity | built |
| ART-0343 | C23 | REQ-0066 | Verify suite tsc lint build PASS | built |
| ART-0344 | C23.1 | REQ-0067 | `organization-detail-members-filter.ts` | built |
| ART-0345 | C23.1 | REQ-0067 | `OrganizationDetailMembersSection` filter toolbar | built |
| ART-0346 | C23.1 | REQ-0067 | `OrganizationDetailScreen` wire members section | built |
| ART-0347 | C23.1 | REQ-0067 | Verify suite tsc lint build PASS | built |
| ART-0348 | C24 | REQ-0068 | `FilterSelectOptionLabel` + rich `FilterSelect` | built |
| ART-0349 | C24 | REQ-0068 | `filter-select-option-presets.ts` | built |
| ART-0350 | C24 | REQ-0068 | Migrate enum FilterSelect call sites (~12 files) | built |
| ART-0351 | C24 | REQ-0068 | Org billing footer border-t removal | built |
| ART-0352 | C24 | REQ-0068 | Tests + verify PASS | built |
| ART-0356 | C25 | REQ-0069 | Calendar label DRY + empty-copy chips | built |
| ART-0357 | C25 | REQ-0069 | `doctor-identity-map.ts` + `DoctorFilterSelect` | built |
| ART-0358 | C25 | REQ-0069 | ServicesDoctorFilters preset migration | built |
| ART-0359 | C25 | REQ-0069 | Tests + verify PASS | built |
| ART-0360 | C26 | REQ-0070 | `invoice-management-display.ts` + billing section heading | built |
| ART-0361 | C26 | REQ-0070 | `ControlPanelEntityListShell` amber + `InvoiceVisitListCell` | built |
| ART-0362 | C26 | REQ-0070 | KPI hints + clinical list table frame + column sort fix | built |
| ART-0363 | C26 | REQ-0070 | Tests + verify PASS | built |
| ART-0366 | C26.1 | REQ-0071 | `invoice-management-scope.ts` URL parse/build | built |
| ART-0367 | C26.1 | REQ-0071 | `InvoiceManagementScopeContext` + org query | built |
| ART-0368 | C26.1 | REQ-0071 | `OrganizationFilterSelect` + SSR org seed page | built |
| ART-0369 | C26.1 | REQ-0071 | Tests + DECISION_LOG tradeoffs | built |
| ART-0372 | C26.2 | REQ-0072 | `invoiceMatchesDoctorScope` + doctor filter | built |
| ART-0373 | C26.2 | REQ-0072 | Invoice hub toolbar + URL doctor scope | built |
| ART-0374 | C26.2 | REQ-0072 | Tests + verify PASS | built |
| ART-0378 | C27 | REQ-0073 | `invoice-doctor-scope.ts` unified rule + Prisma where | built |
| ART-0379 | C27 | REQ-0073 | Server doctor list + billing-totals API + invoices-scope | built |
| ART-0380 | C27 | REQ-0073 | `byDoctor`/`byDoctorTotals` keys + `useInvoiceScopedBilling` | built |
| ART-0381 | C27 | REQ-0073 | Scope context KPI wiring + SSR doctor seed | built |
| ART-0382 | C27 | REQ-0073 | `mergeInvoiceIntoScopedListCaches` + scoped invalidation | built |
| ART-0383 | C27 | REQ-0073 | Tests + verify PASS | built |
| ART-0384 | C27.1 | REQ-0074 | removeInvoice + patchScopedTotals cache helpers | built |
| ART-0385 | C27.1 | REQ-0074 | usePayments mutation parity (record/refund/delete) | built |
| ART-0386 | C27.1 | REQ-0074 | Viewer-scoped server KPI + SSR seed + hook | built |
| ART-0387 | C27.1 | REQ-0074 | Tests + verify PASS | built |
| ART-0388 | C27.2 | REQ-0075 | `invoice-billing-kpi-aggregate.ts` server period/extended KPIs | built |
| ART-0389 | C27.2 | REQ-0075 | Enriched payload + optimistic patch + stats row server-first | built |
| ART-0390 | C27.2 | REQ-0075 | `useInvoiceScopedBilling` KPI expose + org panel DRY | built |
| ART-0391 | C27.2 | REQ-0075 | SSR enriched totals seed + tests + verify PASS | built |
| ART-0392 | C28 | REQ-0076 | invoiceKpiValueRowHint + management KPI grid all-time | built |
| ART-0393 | C28 | REQ-0076 | Billing header inline scope filters + stats row cleanup | built |
| ART-0394 | C28 | REQ-0076 | Status-only CP billing-totals + management cache patch | built |
| ART-0395 | C28 | REQ-0076 | Unified CP SSR seed + tests + verify PASS | built |
| ART-0396 | C29 | REQ-0077 | `cpTwoLine` invoice # + compactStack description | built |
| ART-0397 | C29 | REQ-0077 | `amount_status` column + sky issuer Created row | built |
| ART-0398 | C29 | REQ-0077 | Scope filter inline row + Medicine specialty backfill | built |
| ART-0399 | C29 | REQ-0077 | Tests + verify PASS | built |
| ART-0400 | C29 | REQ-0077 | Docs + commit `db8dd57` | built |
| ART-0401 | C30 | REQ-0078 | Prisma Invoice audit FKs + backfill script | built |
| ART-0402 | C30 | REQ-0078 | `invoice-api-include` + `invoice-api-enrich` | built |
| ART-0403 | C30 | REQ-0078 | API write stamps + enriched PATCH/GET | built |
| ART-0404 | C30 | REQ-0078 | Detail Record Audit + `mapInvoiceRecordAuditActors` | built |
| ART-0405 | C30 | REQ-0078 | Date picker close + edit amount hint | built |
| ART-0406 | C30 | REQ-0078 | Tests + verify PASS + commit `fe84f2b` | built |
| ART-0407 | C31 | REQ-0079 | CP invoice column merge (identity + amount + badge) | built |
| ART-0408 | C31 | REQ-0079 | `invoice-management-columns` + table cells | built |
| ART-0409 | C31 | REQ-0079 | Tests + verify PASS | built |
| ART-0410 | C32 | REQ-0080 | `AppointmentsManagement` CP list shell + stats/filters | built |
| ART-0411 | C32 | REQ-0080 | `appointment-management-columns` + SSR calendar bundle | built |
| ART-0412 | C32 | REQ-0080 | Header Export/New + dialog footer parity | built |
| ART-0413 | C32 | REQ-0080 | Tests + verify PASS | built |
| ART-0414 | C33 | REQ-0081 | `NotificationsManagement` rose CP shell | built |
| ART-0415 | C33 | REQ-0081 | `notification-management-columns` + filters/metrics | built |
| ART-0416 | C33 | REQ-0081 | `notification-type-display.ts` shared w/ navbar | built |
| ART-0417 | C33 | REQ-0081 | Tests + commit `378a88d` verify 1084/1084 | built |
| ART-0424 | C34 | REQ-0082 | `notification-link.ts` parse + stale cleanup | built |
| ART-0425 | C34 | REQ-0082 | `notification-link-validity.ts` + list enrich | built |
| ART-0426 | C34 | REQ-0082 | GET/SSE/prefetch `link_valid` + serialize type | built |
| ART-0427 | C34 | REQ-0082 | CP/navbar gating + role-aware fallback | built |
| ART-0428 | C34 | REQ-0082 | `EntityUnavailableScreen` + detail pages | built |
| ART-0429 | C34 | REQ-0082 | Invoice delete → `invalidateNotificationsAndCrossTab` | built |
| ART-0430 | C34 | REQ-0082 | Tests notification-link* + stale-cleanup | built |
| ART-0431 | C34.1 | REQ-0082 | `notification-list-filter.ts` + awaited DELETE cleanup | built |
| ART-0432 | C35 | REQ-0083 | `notification-navigation.ts` + clickable content column | built |
| ART-0433 | C35 | REQ-0083 | Remove Link column + empty actions disabled | built |
| ART-0434 | C35 | REQ-0083 | Notifications header session lead removed | built |
| ART-0435 | C35 | REQ-0083 | AppointmentDialogGeneralSection Select controlled fix | built |
| ART-0436 | C35.1 | REQ-0083 | CSV export Link Valid audit column + file comment fix | built |
| ART-0437 | C36 | REQ-0084 | OAuth redirect + google-calendar-routes | built |
| ART-0438 | C36 | REQ-0084 | Glass panel components + ui-classes | built |
| ART-0439 | C36 | REQ-0084 | Events DataTable + stats strip | built |
| ART-0440 | C36 | REQ-0084 | Header actions + invalidateGoogleCalendarAndCrossTab | built |
| ART-0441 | C36 | REQ-0084 | Advanced ICS import + treating_physician_id API | built |
| ART-0442 | C36 | REQ-0084 | google-calendar-display + tests | built |
| ART-0445 | C36.1 | REQ-0085 | Prisma google_calendar_event_id + updateGoogleEvent | built |
| ART-0446 | C36.1 | REQ-0085 | google-calendar-sync-appointment lib | built |
| ART-0447 | C36.1 | REQ-0085 | Auto-sync appointment POST/PATCH/DELETE routes | built |
| ART-0448 | C36.1 | REQ-0085 | Manual sync UI (menu, card, CP columns, detail bar) | built |
| ART-0449 | C36.1 | REQ-0085 | calendar-import resolver + OAuth param wiring | built |
| ART-0450 | C36.1 | REQ-0085 | calendar-import + sync-appointment + routes tests | built |
| ART-0451 | C36.2 | REQ-0086 | unlink + runAppointmentGoogleCalendarSideEffects | built |
| ART-0452 | C36.2 | REQ-0086 | PATCH/PUT/DELETE route parity | built |
| ART-0453 | C36.2 | REQ-0086 | GoogleCalendarSyncContext + AppProviders | built |
| ART-0454 | C36.2 | REQ-0086 | Dashboard SSR gcal seed + maybeInvalidate helper | built |
| ART-0455 | C36.2 | REQ-0086 | AppointmentActionsMenu sync test + SyncInfoCard copy | built |
| ART-0456 | C36.2.1 | REQ-0087 | Appointment detail pages gcal SSR prefetch | built |
| ART-0457 | C36.2.1 | REQ-0087 | AppointmentDetailScreenShared gcal cache seed | built |
| ART-0458 | C38 | REQ-0088 | GCal API warning banner + connect backfill | built |
| ART-0459 | C38 | REQ-0088 | Tests + verify PASS | built |
| ART-0460 | C38 | REQ-0088 | Docs sync | built |
| ART-0461 | C39.1 | REQ-0089 | `telehealth-queue-filter.ts` + UI classes | built |
| ART-0462 | C39.1 | REQ-0089 | `TelehealthQueuePage` + stats/filter pills | built |
| ART-0463 | C39.1 | REQ-0089 | `TelehealthUpNextCard` + `TelehealthQueueList` | built |
| ART-0464 | C39.1 | REQ-0089 | `TelehealthQueueRow` + schedule empty state | built |
| ART-0465 | C39.1 | REQ-0089 | `telehealth-queue-empty-copy.ts` + tests | built |
| ART-0466 | C39.1 | REQ-0089 | `telehealth-queue-display.ts` + tests | built |
| ART-0467 | C39.1 | REQ-0089 | CP route `control-panel/telehealth-queue` | built |
| ART-0468 | C39.1 | REQ-0089 | Verify 1203/1203 commit `3fd00b1` | built |
| ART-0469 | C39.2 | REQ-0090 | `TelehealthQueueDoctorCategoryBlock` | built |
| ART-0470 | C39.2 | REQ-0090 | Doctor from `doctors.all` + identity inline | built |
| ART-0471 | C39.2 | REQ-0090 | Clock + status header chips | built |
| ART-0472 | C39.2 | REQ-0090 | List row full date + status after title | built |
| ART-0473 | C39.2 | REQ-0090 | `telehealth-queue-display` category mapper | built |
| ART-0474 | C39.2 | REQ-0090 | Tests + verify PASS | built |
| ART-0475 | C40 | REQ-0091 | `app/telehealth-queue/page.tsx` portal route | built |
| ART-0476 | C40 | REQ-0091 | `telehealth-queue-portal-prefetch.ts` | built |
| ART-0477 | C40 | REQ-0091 | `telehealth-scheduling-types.ts` + tests | built |
| ART-0478 | C40 | REQ-0091 | `useTelehealthSchedulingTypesForDoctor` hook | built |
| ART-0479 | C40 | REQ-0091 | `TelehealthQueueChromeActions` + navbar link | built |
| ART-0480 | C40 | REQ-0091 | `viewerRole` threading + patient plain title | built |
| ART-0481 | C40 | REQ-0091 | `portal-page-chrome-config` telehealth_queue | built |
| ART-0482 | C40 | REQ-0091 | `VisitTypePickerList` inactive type tiles | built |
| ART-0483 | C40 | REQ-0091 | `telehealthBookingPreset` / `telehealthOnly` dialogs | built |
| ART-0484 | C40 | REQ-0091 | Identity inlines `viewerRole` prop | built |
| ART-0485 | C40 | REQ-0091 | `usePatientBookableAppointmentTypes` telehealthOnly | built |
| ART-0486 | C40 | REQ-0091 | Verify 1206/1206 (WIP uncommitted) | built |

## Verification Commands (project default)

```bash
npm test        # 1206 passed (C40, 2026-06-15)
npx tsc --noEmit
npm run lint
npm run build
```
