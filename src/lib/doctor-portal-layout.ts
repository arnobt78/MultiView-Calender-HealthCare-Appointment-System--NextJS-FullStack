/** Shared doctor portal grid + list-body pulse helpers (page + SSR skeleton). */

export const doctorPortalPanelPairGridClass =
  "grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6";

/** Inline skeleton rows inside mounted panel chrome (CP-style). */
export const doctorPortalListBodyPulseClass = "animate-pulse rounded-lg bg-slate-200/80";

/** Billing panel glass tint — sky tone (not in doctor-settings violet/emerald map). */
export const doctorPortalBillingPanelClass =
  "border-sky-400/25 bg-white/70 shadow-[0_14px_44px_rgba(2,132,199,0.18)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55";

/** Bordered card shell — whole invoice item; sky band sits inside top edge only. */
export const doctorPortalInvoiceListItemShellClass =
  "overflow-hidden rounded-xl border border-sky-200/50 bg-white/80 shadow-[0_10px_28px_rgba(14,165,233,0.08)] backdrop-blur-sm";

/** Per-invoice header band — sky tint only (border lives on list item shell). */
export const doctorPortalInvoiceHeaderStripClass =
  "bg-sky-50/80 px-2.5 py-1 backdrop-blur-sm";

/** Patients roster panel — emerald tone (matches Users icon row). */
export const doctorPortalPatientsPanelClass =
  "border-emerald-400/25 bg-white/70 shadow-[0_14px_44px_rgba(16,185,129,0.16)] backdrop-blur-sm supports-[backdrop-filter]:bg-white/55";
