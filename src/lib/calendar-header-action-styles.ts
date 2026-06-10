/**
 * Glass action buttons — shared with `CalendarHeader` (Import .ics / New Appointment / Book Appointment) and control-panel toolbars.
 * Keep `h-10` in sync with calendar filter row height; all interactive chips include `cursor-pointer`.
 */
export const violetGlassImportButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-violet-300/55 bg-violet-50/75 px-4 text-sm font-medium text-violet-600 shadow-[0_10px_24px_rgba(139,92,246,0.18)] backdrop-blur-md transition-all duration-200 hover:border-violet-400/60 hover:bg-violet-100/75 hover:text-violet-800 hover:shadow-[0_12px_30px_rgba(139,92,246,0.24)] [&_svg]:size-4";

export const emeraldGlassPrimaryButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-emerald-400/45 bg-linear-to-r from-emerald-500 to-emerald-700 px-4 text-sm font-medium text-white shadow-[0_10px_40px_rgba(16,185,129,0.42)] backdrop-blur-md transition-all duration-200 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 hover:text-white hover:shadow-[0_14px_48px_rgba(16,185,129,0.58)] active:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/**
 * Sky glass primary — used by appointment dialog Save/Update to pair with `skyGlassBackButtonClass` cancel
 * and match Global Search outer glow (sky-400 / rgb(2,132,199)).
 */
export const skyGlassPrimaryButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-sky-400/45 bg-linear-to-r from-sky-500 to-sky-600 px-4 text-sm font-medium text-white shadow-[0_10px_40px_rgba(2,132,199,0.42)] backdrop-blur-md transition-all duration-200 hover:from-sky-500 hover:via-sky-500 hover:to-sky-700 hover:text-white hover:shadow-[0_14px_48px_rgba(2,132,199,0.55)] active:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Book Appointment — patient portal `PortalChromeHeader` + dashboard toolbar (no `size="lg"`). */
export const bookAppointmentGlassTriggerClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-sky-400/45 bg-linear-to-r from-sky-500 to-sky-600 px-5 text-sm font-medium text-white shadow-[0_10px_40px_rgba(2,132,199,0.42)] backdrop-blur-md transition-all duration-200 hover:from-sky-500 hover:via-sky-500 hover:to-sky-700 hover:text-white hover:shadow-[0_14px_48px_rgba(2,132,199,0.55)] active:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[>svg]:px-5 [&_svg]:size-4";

/** Calendar filter reset + control-panel list resets — visible text (not solid `default` fill). */
export const skyGlassResetButtonClass =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-sky-400/45 bg-sky-50/85 px-3.5 text-sm font-medium text-sky-800 shadow-[0_10px_28px_rgba(2,132,199,0.22)] backdrop-blur-md transition-all duration-200 hover:border-sky-500/55 hover:bg-sky-100/90 hover:text-sky-900 hover:shadow-[0_12px_34px_rgba(2,132,199,0.3)] [&_svg]:size-3.5";

/** Optional outer frame for wide data tables (patient list, etc.). */
export const skyGlassTableFrameClass =
  "rounded-2xl border border-sky-200/55 bg-white/90 shadow-[0_14px_48px_-12px_rgba(14,165,233,0.38)]";

/** Control-panel back / cancel — matches navbar-adjacent h-10 rhythm. */
export const skyGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-sky-300/50 bg-white/75 px-4 text-sm font-medium text-sky-900 shadow-[0_10px_28px_rgba(2,132,199,0.2)] backdrop-blur-md transition-all duration-200 hover:border-sky-400/55 hover:bg-sky-50/90 hover:shadow-[0_12px_34px_rgba(2,132,199,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Emerald glass back — CP doctor detail (pairs with emerald card glow). */
export const emeraldGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-emerald-300/50 bg-white/75 px-4 text-sm font-medium text-emerald-900 shadow-[0_10px_28px_rgba(16,185,129,0.2)] backdrop-blur-md transition-all duration-200 hover:border-emerald-400/55 hover:bg-emerald-50/90 hover:shadow-[0_12px_34px_rgba(16,185,129,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Slate glass back — legacy admin detail tone. */
export const slateGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-slate-300/50 bg-white/75 px-4 text-sm font-medium text-slate-900 shadow-[0_10px_28px_rgba(100,116,139,0.2)] backdrop-blur-md transition-all duration-200 hover:border-slate-400/55 hover:bg-slate-50/90 hover:shadow-[0_12px_34px_rgba(100,116,139,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Indigo glass back — organization detail (pairs with indigo CP tab). */
export const indigoGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-indigo-300/50 bg-white/75 px-4 text-sm font-medium text-indigo-900 shadow-[0_10px_28px_rgba(99,102,241,0.2)] backdrop-blur-md transition-all duration-200 hover:border-indigo-400/55 hover:bg-indigo-50/90 hover:shadow-[0_12px_34px_rgba(99,102,241,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Destructive glass — delete / remove. */
export const roseGlassDangerButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-rose-300/55 bg-rose-50/85 px-4 text-sm font-medium text-rose-800 shadow-[0_10px_28px_rgba(244,63,94,0.22)] backdrop-blur-md transition-all duration-200 hover:border-rose-400/60 hover:bg-rose-100/90 hover:shadow-[0_12px_34px_rgba(244,63,94,0.3)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Violet glass primary — category CRUD dialog (distinct from emerald patient + sky appointment). */
export const violetGlassPrimaryButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-violet-400/45 bg-linear-to-r from-violet-500 to-violet-700 px-4 text-sm font-medium text-white shadow-[0_10px_40px_rgba(139,92,246,0.42)] backdrop-blur-md transition-all duration-200 hover:from-violet-500 hover:via-violet-600 hover:to-violet-700 hover:text-white hover:shadow-[0_14px_48px_rgba(139,92,246,0.58)] active:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Violet glass back / cancel — pairs with `violetGlassPrimaryButtonClass`. */
export const violetGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-violet-300/50 bg-white/75 px-4 text-sm font-medium text-violet-900 shadow-[0_10px_28px_rgba(139,92,246,0.2)] backdrop-blur-md transition-all duration-200 hover:border-violet-400/55 hover:bg-violet-50/90 hover:shadow-[0_12px_34px_rgba(139,92,246,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Amber glass back — portal category detail + category-management list parity. */
export const amberGlassBackButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-amber-300/50 bg-white/75 px-4 text-sm font-medium text-amber-900 shadow-[0_10px_28px_rgba(217,119,6,0.2)] backdrop-blur-md transition-all duration-200 hover:border-amber-400/55 hover:bg-amber-50/90 hover:shadow-[0_12px_34px_rgba(217,119,6,0.28)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";

/** Amber glass primary — invoice create/edit dialog submit (pairs with invoiceDialogGlassBackButtonClass). */
export const amberGlassPrimaryButtonClass =
  "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-amber-400/45 bg-linear-to-r from-amber-500 to-amber-600 px-4 text-sm font-medium text-white shadow-[0_10px_40px_rgba(245,158,11,0.42)] backdrop-blur-md transition-all duration-200 hover:from-amber-500 hover:via-amber-500 hover:to-amber-700 hover:text-white hover:shadow-[0_14px_48px_rgba(245,158,11,0.55)] active:text-white disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4";
