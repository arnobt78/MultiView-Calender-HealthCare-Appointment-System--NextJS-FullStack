import { Calendar, CalendarDays, Columns3, LayoutList, Search } from "lucide-react";

export default function DashboardCalendarShellSkeleton() {
  const currentDate = new Date();
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-visible">
      <div className="shrink-0">
        <div className="flex items-center justify-between px-2 py-3 sm:px-4 lg:px-8">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2 sm:gap-3">
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-gray-400 shadow-xl">
                ←
              </div>
              <div className="text-base font-medium text-gray-700">
                <span className="tracking-wide">
                  {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
                    currentDate
                  )}
                  {", "}
                </span>
                <span>
                  {new Intl.DateTimeFormat("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(currentDate)}
                </span>
              </div>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-gray-400 shadow-xl">
                →
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex h-10 items-center gap-2 rounded-full border border-sky-500/55 bg-linear-to-r from-sky-500 to-sky-700 px-4 text-sm text-white shadow-[0_12px_36px_rgba(2,132,199,0.34)]">
                <LayoutList className="size-4" />
                List
              </div>
              <div className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-300/55 bg-white/70 px-4 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                <Calendar className="size-4" />
                Day
              </div>
              <div className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-300/55 bg-white/70 px-4 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                <Columns3 className="size-4" />
                Week
              </div>
              <div className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-300/55 bg-white/70 px-4 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                <CalendarDays className="size-4" />
                Month
              </div>
            </div>
            <div className="inline-flex h-10 items-center rounded-full border border-violet-300/55 bg-violet-50/75 px-4 text-sm text-violet-600 shadow-[0_10px_24px_rgba(139,92,246,0.18)]">
              Import .ics
            </div>
            <div className="inline-flex h-10 items-center rounded-full border border-emerald-400/45 bg-linear-to-r from-emerald-500 to-emerald-700 px-4 text-sm text-white shadow-[0_10px_40px_rgba(16,185,129,0.42)]">
              New Appointment
            </div>
          </div>
        </div>
      </div>

      <div className="inner-dashboard-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-8 sm:px-4 lg:px-8">
        <div className="mb-2 flex flex-wrap items-center gap-2 pt-0">
          <h2 className="text-xl font-semibold tracking-tight text-gray-700">Appointment List</h2>
          <span className="calendar-glass-badge calendar-glass-badge-sky min-h-6 min-w-[90px] justify-center">Total: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-sky-300/40" /></span>
          <span className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Today: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-emerald-300/40" /></span>
          <span className="calendar-glass-badge calendar-glass-badge-blue min-h-6 min-w-[90px] justify-center">Tomorrow: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-blue-300/40" /></span>
          <span className="calendar-glass-badge calendar-glass-badge-violet min-h-6 min-w-[90px] justify-center">Later: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-violet-300/40" /></span>
          <span className="calendar-glass-badge calendar-glass-badge-slate min-h-6 min-w-[90px] justify-center">Passed Days: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-slate-300/40" /></span>
          <span className="px-1 text-xs font-semibold text-gray-500">Status:</span>
          <span className="calendar-glass-badge calendar-glass-badge-amber min-h-6 min-w-[90px] justify-center">Open: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-amber-300/40" /></span>
          <span className="calendar-glass-badge calendar-glass-badge-rose min-h-6 min-w-[90px] justify-center">Alert: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-rose-300/40" /></span>
          <span className="calendar-glass-badge calendar-glass-badge-emerald min-h-6 min-w-[90px] justify-center">Done: <span className="ml-1 inline-block h-3 w-5 animate-pulse rounded bg-emerald-300/40" /></span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <div className="h-10 rounded-2xl border bg-white pl-9" />
          </div>
          <div className="h-10 w-36 rounded-2xl border bg-white" />
          <div className="h-10 w-32 rounded-2xl border bg-white" />
          <div className="h-10 w-32 rounded-2xl border bg-white" />
          <div className="h-10 w-32 rounded-2xl border bg-white" />
          <div className="h-10 w-32 rounded-2xl border bg-white" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="relative min-h-[130px] overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 shadow-md"
            >
              <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl bg-gray-200" />
              <div className="flex items-stretch p-4 pl-6">
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-44 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-72 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-64 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <div className="h-8 w-20 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
