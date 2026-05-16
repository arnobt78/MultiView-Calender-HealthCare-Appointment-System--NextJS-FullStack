# HealthCal Pro — Project Walkthrough

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Prisma (PostgreSQL), TanStack Query v5, Framer Motion, Shadcn/UI, Radix UI, Sonner (toasts), Zustand, jose (edge JWT), bcryptjs, Vercel Blob, Stripe, Resend.

### Role-based entity detail routing

- **Href map:** `src/lib/entity-routes.ts` — `appointmentDetailHref`, `patientDetailHref`, `categoryDetailHref`, `doctorDetailHref`.
- **Access:** `src/lib/appointment-access.ts` — `resolveAppointmentAccess` / `computeAppointmentAccessLevel` (`none` | `view` | `mutate`). Used by `GET|PUT|PATCH|DELETE /api/appointments/[id]` and SSR detail pages.
- **Patient gates:** `src/lib/patient-access.ts` — `canViewPatientDetail`, `doctorIsRelatedToPatient`.
- **Routes:** Admin stays on `/control-panel/*`. Doctors/patients use `/appointments/[id]`, `/patients/[id]`, `/categories/[id]`, `/doctors/[id]` with thin layouts (no CP sidebar). `control-panel/layout.tsx` redirects non-admins away.
- **UI:** `AppointmentDetailScreen`, `CategoryDetailScreen`, `PatientDetailScreen`; `RoleEntityLink` on client surfaces; `PrefetchingLink` + `prefetchQueriesForControlPanelHref` for hover prefetch.
- **Invalidation:** unchanged — `invalidateAfterAppointmentMutation` still busts appointments, portals, dashboard, patient snapshots.
- **Links wired:** calendar (`AppointmentList`, `DayView`, `WeekView`/`MonthView` via `AppointmentHoverCard`), portals, global search, notification deep links (create/booking/cron).
- **Verify:** `npm test && npx tsc --noEmit && npm run lint && npm run build`.

### Doctor display + `/services`

- **Route:** `/services` — `src/app/services/page.tsx` SSR-prefetches doctors + global types; client `ServicesPage.tsx`.
- **API:** `GET /api/doctors` → specialty, bio, image, `doctor_availabilities`, `appointment_types_owned`, `patient_count` (`queryKeys.doctors.all`).
- **Provider:** `DoctorDisplayProvider` (`src/context/DoctorDisplayContext.tsx`) in `AppProviders` — specialty glass classes + robohash helper (no extra network).
- **Components:** `src/components/shared/doctor-display/*` — badges, avatars, `DoctorIdentityRow`, `DoctorLinkStack`, `DoctorCardHeroImage`, availability groups; `ServicesDoctorFilters` for client-side grid filters.
- **Layout:** specialty badge always on its own line below name/email (`showIcon` default true). `/services` hero uses `object-contain` (no head crop); badge is in the card body under email, not on the image.
- **Card UX:** flush hero image, `RoleEntityLink` doctor name, copy-email, grouped availability rows, book CTA via `BookAppointmentDialog`. Date filter matches calendar chrome (left calendar icon, `pl-8`, `min-w-[155px]`).
- **Global reuse:** patient primary-doctor column/detail (`DoctorLinkStack`), Related Appointments treating physician + `doctor_specialty` from snapshot API, portal doctor picker, appointment dialog treating-physician select, admin portal doctor cards, Doctor Management specialty column (`DoctorSpecialtyBadge`).
- **Invalidation:** doctor PATCH / availability mutations → `invalidateUsersAndAuth` / `invalidateDoctorSchedule` → `doctors.all` refetch (no new keys).

### Control panel entity split (users vs patients)

- **`patients` table** (`Patient` model): clinical/client records used by Patient Management and appointments. Demo seed creates one row aligned with `test@patient.com` so `/control-panel/patient-management` lists a sample patient.
- **`users` table** (`User` model): auth accounts with `role`. **Doctor Management** lists `GET /api/users?role=doctor`. **User / Admin Management** lists `GET /api/users?role=admin` (admin only; excludes doctor/patient rows).
- **`ControlPanelPage` tabs**: `/control-panel/patient-management` renders TanStack `PatientManagement`; `/control-panel/doctor-management` and `/control-panel/user-admin-management` render filtered user tables. Legacy URL `/control-panel/doctor-user-management` still maps to the doctors tab.
- **Hooks**: `useUsers({ role: "doctor" })`, `useUsers({ role: "admin" })`, or unfiltered list — query key includes the filter object; `invalidateUsersAndAuth` refreshes after PATCH.

### Demo seed

Run `npm run db:seed-test-user` after migrations: upserts three `users`, doctor availability + appointment type, and one `patients` row for the demo portal email so Patient Management is non-empty. Optional: `npm run db:seed-demo-clinical` (or rely on seed-test-user) writes `clinical_profile` JSON on the demo patient for allergies/notes.

### Patient pipeline (management + detail)

- **Schema**: `Patient.clinical_profile` (`Json?`) — merged on `PUT /api/patients/[id]` (not fully replaced); **email is never updated from the client** on PUT (demo safety).
- **API**: `GET /api/patients/[id]/snapshot` returns `{ patient, appointments, invoices }` for the patient detail "Related" sections (invoices matched via `appointment_id`). Each appointment row includes `doctor_specialty` (resolved treating/owner user) for glass badges in the Treating physician column.
- **React Query**: `queryKeys.patients.snapshot(id)`, hook `usePatientSnapshot(id)` (`src/hooks/usePatients.ts`). Prefix invalidation `queryKeys.patients.all` refreshes list, detail, and snapshot together.
- **Invalidation wiring**: `invalidateAfterAppointmentMutation` calls `invalidateInvoicesAndOverview`, which now also invalidates `queryKeys.patients.all` (appointments + invoices affect patient aggregates). `invalidateSharingAndAppointments` invalidates `patients.all` so assignee changes refresh snapshots without navigation.
- **UI**: `PatientListFiltersProvider` + status dropdown (all/active/inactive); `DataTable` optional `globalFilterFn` for multi-column search (name + email). Sortable headers via `DataTableColumnHeader`. Row menu: View (`?mode` default), Edit (`?mode=edit`). **`PatientDetailScreen`** (client): view vs edit from URL, fixed footer actions, **`PatientDetailForm`** with read-only email + clinical fields mapped into `clinical_profile`.
- **Shared table patterns**: Doctor/User/Category management tables reuse **`DataTableColumnHeader`** + **`globalFilterFn`** where applicable (name/email or label/description).
- **Loading**: `src/app/control-panel/loading.tsx` returns `null` so route transitions don't flash a full skeleton; tables keep localized skeleton rows via `DataTable` `isLoading`.

### Avatar cropping (detail pages)

User detail SSR page uses `Avatar` + `AvatarImage` with `className="object-cover object-center"` and `overflow-hidden` on the root so portrait photos are not stretched inside circles (same treatment as list rows and navbar).

### Safe image fallback

- `src/components/ui/safe-image.tsx`: `next/image` first, automatic native `<img>` fallback on `onError` for remote URLs.
- `src/components/shared/UserAvatar.tsx`: reusable avatar wrapper with skeleton state, safe-image fallback, and initials fallback.
- Applied in navbar and control-panel user/patient tables + user detail page for consistent image rendering.
- `DataTable` loading state keeps table/header static and shows a lightweight inline loading row (no skeleton flash), preserving layout stability.
- Management tables use shared fixed column sizing (`meta.headClassName` / `meta.cellClassName`) for stable layout and reduced reflow on filter/loading states.

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
- `src/components/pages/ControlPanelPage.tsx` — renders mobile hamburger Sheet + horizontal tab strip + all `TabsContent` panels. Desktop sidebar has been moved to layout.

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
| Patient Portal | `pages/PatientPortalPage.tsx` | Profile field values + summary badge values + appointment timeline rows |

### Deleted loading.tsx files

- `src/app/insights/loading.tsx` — deleted; replaced by inline skeleton in `AnalyticsPage.tsx`
- `src/app/patient-portal/loading.tsx` — deleted; replaced by inline skeleton in `PatientPortalPage.tsx`

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
│   │   ├── invoices/[id]/page.tsx
│   │   ├── organizations/[id]/page.tsx
│   │   └── patients/[id]/page.tsx
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
│       ├── invoices/                 CRUD
│       ├── payments/                 Stripe webhook + checkout
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
│   │   ├── AppointmentList.tsx      Main calendar list view
│   │   ├── WeekView.tsx / MonthView.tsx / DayView.tsx
│   │   ├── AppointmentDialog.tsx    Create/edit appointment modal
│   │   ├── AppointmentHoverCard.tsx
│   │   ├── CalendarHeader.tsx       Fixed sticky header row
│   │   ├── Filters.tsx / SearchBar.tsx
│   │   ├── ImportICSDialog.tsx
│   │   └── VideoCall.tsx            Telehealth video modal
│   ├── control-panel/
│   │   ├── ControlPanelSidebarNav.tsx  Desktop sidebar (client, pathname-aware, scroll indicator)
│   │   ├── DashboardOverview.tsx       Inline skeleton + glassmorphic
│   │   ├── AppointmentsManagement.tsx / AppointmentDetailForm.tsx — inline skeleton + glassmorphic
│   │   ├── DoctorManagement.tsx / DoctorDetailForm.tsx
│   │   ├── PatientManagement.tsx / PatientDetailForm.tsx — reference inline skeleton pattern
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
│   ├── useNotifications.ts     SSE + React Query
│   ├── useOrganization.ts
│   ├── useAnalytics.ts
│   ├── useInsights.ts
│   ├── useDashboardOverview.ts Exposes isFetching + dataUpdatedAt for refresh button
│   ├── useGoogleCalendar.ts
│   ├── usePayments.ts          invoices + pay + create + delete
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
// Cache buster: "v1" — bump when shipping a breaking data-shape change.
persistOptions: { persister, maxAge: 10 * 60 * 1000, buster: "v1" }
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
- `src/lib/api-client.ts` now routes generic API errors through `notify.error(...)`.

### Shared Sensitive-Action Dialog

- New reusable confirmation component: `src/components/shared/ConfirmActionDialog.tsx`
- Built on shadcn `AlertDialog` primitives with semantic variants (`destructive`, `warning`, `info`) and icon/title/subtitle support.
- Designed for delete/disconnect/permission-sensitive actions.

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

## Cal-style availability (phase 1)

- **Models** (`prisma/schema.prisma`): `DoctorAvailability` (weekly windows + IANA `timezone`), `DoctorTimeOff`, `AppointmentType` (duration, buffers, slot step, minimum notice).
- **API**: `GET /api/availability/slots?doctorId=&date=YYYY-MM-DD&typeId=` — returns `{ slots: ISO[]; timezone }`.
- **Client**: `useAvailabilitySlots` in `src/hooks/useAvailabilitySlots.ts` with keys under `queryKeys.availability`.
- **Staff create/edit**: `AppointmentDialogGeneralSection` wires the same `GET /api/appointment-types` + slot chips into `AppointmentDialog` (doctor id = session user / appointment `owner_id` for busy overlap math).
- **Invalidation**: `invalidateAfterAppointmentMutation` refreshes appointments, notifications, availability slots, **invoices + dashboard overview + all patient queries** (shared appointment/billing graph). Slot pickers use `queryKeys.availability`.
- **RBAC (incremental)**: `users.role === 'patient'` cannot POST/PUT/PATCH/DELETE dashboard appointments or POST organizations; registration defaults new users to `role: admin`.

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

"Import .ics" and "New Appointment" buttons are hidden for `patient` role users. The calendar is read-only view for patients.

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

Patients are normally forbidden from listing all users. Exception: if the request includes `?role=doctor` or `?roles=doctor`, patients are allowed (scoped to `id` + `display_name` only). This lets the `BookAppointmentDialog` in the patient portal populate the doctor selector.

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

- **Doctor portal**: Doctor-specific dashboard view (analogous to PatientPortalPage) is not yet implemented. Doctors currently see the same dashboard as admins. Role-specific doctor UI is planned.
- **`/api/auth/demo`**: Endpoint still present but no longer used by the landing page. Can be removed or kept for backwards compatibility.
- **Vercel Deployment Protection**: The project is on the Hobby plan. "Require Log In" Vercel Authentication is toggled OFF so that deployment-specific preview URLs (`*.vercel.app`) load without Vercel login, allowing the Vercel dashboard preview thumbnail to render correctly.
- **`src/lib/rate-limit.ts`**: In-memory rate limiter (resets on cold start). For production-grade rate limiting that survives cold starts, use the Redis-backed approach (`src/lib/redis.ts` + Upstash).
