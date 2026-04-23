# HealthCal Pro — Project Walkthrough

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, Prisma (PostgreSQL), TanStack Query v5, Framer Motion, Shadcn/UI, Radix UI, Sonner (toasts), Zustand, jose (edge JWT), bcryptjs, Vercel Blob, Stripe, Resend.

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
│   ├── middleware.ts               Edge JWT guard (single auth check point)
│   │
│   ├── dashboard/page.tsx          → renders <HomePage /> (protected by middleware)
│   ├── analytics/page.tsx
│   ├── insights/page.tsx
│   ├── patient-portal/page.tsx
│   │
│   ├── control-panel/
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
│       ├── appointments/             CRUD + import-ics
│       ├── users/[id]/               CRUD
│       ├── relatives/                CRUD
│       ├── invitations/              CRUD
│       ├── organizations/            CRUD
│       ├── invoices/                 CRUD
│       ├── payments/                 Stripe webhook + checkout
│       ├── notifications/            SSE stream + CRUD
│       ├── analytics/                Aggregated stats
│       ├── insights/                 AI-powered insights
│       ├── dashboard/overview/       Dashboard KPIs
│       ├── patient-portal/           Patient self-service
│       ├── calendar/                 Google Calendar sync/export/import
│       ├── ai/                       Categorise, parse, suggest, summarise
│       └── cron/reminders/           Cron-triggered email reminders
│
├── components/
│   ├── pages/
│   │   ├── LandingPage.tsx          Public marketing page (Ken Burns hero, appointment deck, stats)
│   │   ├── HomePage.tsx             Authenticated dashboard shell
│   │   ├── AnalyticsPage.tsx
│   │   ├── PatientPortalPage.tsx
│   │   ├── PatientDetailView.tsx
│   │   └── TelehealthDashboard.tsx
│   ├── calendar/
│   │   ├── AppointmentList.tsx      Main calendar list view
│   │   ├── WeekView.tsx / MonthView.tsx / DayView.tsx
│   │   ├── AppointmentDialog.tsx    Create/edit appointment modal
│   │   ├── AppointmentHoverCard.tsx
│   │   ├── CalendarHeader.tsx
│   │   ├── Filters.tsx / SearchBar.tsx
│   │   ├── ImportICSDialog.tsx
│   │   └── VideoCall.tsx            Telehealth video modal
│   ├── control-panel/
│   │   ├── DashboardOverview.tsx
│   │   ├── AppointmentsManagement.tsx / AppointmentDetailForm.tsx
│   │   ├── DoctorManagement.tsx / DoctorDetailForm.tsx
│   │   ├── PatientManagement.tsx / PatientDetailForm.tsx
│   │   ├── CategoryManagement.tsx / CategoryDetailForm.tsx
│   │   ├── InvoiceManagement.tsx
│   │   ├── OrganizationManagement.tsx
│   │   ├── NotificationsManagement.tsx
│   │   ├── RelativesManagement.tsx
│   │   ├── ActivitiesManagement.tsx
│   │   └── GoogleCalendarSettings.tsx
│   ├── navbar/Navbar.tsx
│   ├── login/Login.tsx / register/Register.tsx / logout/Logout.tsx
│   └── shared/
│       ├── PageHeader.tsx
│       ├── FilePreview.tsx
│       ├── GlobalSearch.tsx
│       └── QuickActionsModal.tsx
│
├── hooks/
│   ├── useAuth.ts              React Query — /api/auth/me
│   ├── useAppointments.ts      React Query — /api/appointments
│   ├── useUsers.ts             React Query — /api/users
│   ├── useRelatives.ts
│   ├── useNotifications.ts     SSE + React Query
│   ├── useOrganization.ts
│   ├── useAnalytics.ts
│   ├── useInsights.ts
│   ├── useDashboardOverview.ts
│   ├── useGoogleCalendar.ts
│   ├── usePayments.ts
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
│   ├── redis.ts          Upstash Redis client
│   ├── rate-limit.ts     In-memory rate limiter (production: use Redis)
│   ├── rateLimit.ts      checkRateLimit helper
│   ├── google-calendar.ts Google Calendar OAuth + API helpers
│   ├── ai-client.ts      OpenAI / AI SDK client
│   ├── insights-data.ts
│   ├── query-keys.ts     Centralised React Query key factory
│   ├── serializers.ts    DB row → API shape transformers
│   ├── security-headers.ts
│   ├── constants.ts      RATE_LIMITS, PAGINATION, VALIDATION, SESSION, DB_TIMEOUTS
│   ├── utils.ts          cn(), misc
│   └── validation.ts     isValidEmail, validatePassword
│
├── store/
│   └── useAppStore.ts    Zustand — video call state, quick actions modal
│
├── providers/
│   ├── AppProviders.tsx  Composes QueryProvider + DateProvider + ColorProvider + ToastProvider
│   ├── QueryProvider.tsx TanStack Query client
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
│
└── proxy.ts               Next.js 16+ edge proxy — auth, cache, security, prefetch hub
```

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

Core models: User, Appointment, Doctor, Patient, Category, Relative, Invitation, Organization, OrganizationMember, Invoice, Notification, Activity.

All models use UUID primary keys (`@default(uuid())`), have `createdAt`/`updatedAt` timestamps, and are joined by foreign keys with explicit `@relation` names for clarity.

---

## Proxy Matcher (critical — what is and isn't processed)

```
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
