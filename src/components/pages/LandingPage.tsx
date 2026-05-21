"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SafeImage } from "@/components/ui/safe-image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-credentials";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock,
  HeartPulse,
  User,
  UserPlus,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
  LogIn,
} from "lucide-react";
import { RippleButton } from "@/components/ui/RippleButton";
import { notify } from "@/lib/notify";

/* ─── motion tokens ─── */
const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 22, scale: 0.985, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

/* ─── stair-step line reveal (scroll-triggered, below-fold only) ─── */
function StairLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <motion.span
          key={i}
          className="block"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0 }}
          transition={{ delay: i * 0.11, duration: 0.5, ease }}
        >
          {line}
        </motion.span>
      ))}
    </>
  );
}

/* ─── About section rotating cards ─── */
const ABOUT_CARDS = [
  {
    img: "/images/img7.jpg",
    Icon: ShieldCheck,
    iconColor: "text-emerald-400",
    iconBorder: "border-emerald-400/40",
    iconBg: "bg-emerald-400/10",
    title: "Trusted by modern practices",
    desc: "Security-first. Bot-protected. Production-ready.",
  },
  {
    img: "/images/img5.jpg",
    Icon: Users,
    iconColor: "text-sky-400",
    iconBorder: "border-sky-400/40",
    iconBg: "bg-sky-400/10",
    title: "Built for every care team",
    desc: "Multi-role RBAC, org-wide oversight, and smart invitations.",
  },
  {
    img: "/images/img6.jpg",
    Icon: HeartPulse,
    iconColor: "text-rose-400",
    iconBorder: "border-rose-400/40",
    iconBg: "bg-rose-400/10",
    title: "Real-time care coordination",
    desc: "Live notifications, Calendar sync, and telehealth video.",
  },
] as const;

/* ─── hero image list ─── */
const HERO_IMAGES = [
  "/images/img1.avif",
  "/images/img2.webp",
  "/images/img3.webp",
  "/images/img4.avif",
  "/images/img9.avif",
];

/* ─── Ken Burns two-layer background (fixed viewport) ─── */
function HeroBackground({ prefersReduced }: { prefersReduced: boolean | null }) {
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const state = useRef({ active: 0, index: 0, busy: false, lastAdvance: 0 });

  useEffect(() => {
    const A = layerA.current;
    const B = layerB.current;
    if (!A || !B) return;
    const layers = [A, B];
    const s = state.current;

    A.style.backgroundImage = `url("${HERO_IMAGES[0]}")`;
    B.style.backgroundImage = `url("${HERO_IMAGES[1]}")`;

    const goNext = () => {
      if (s.busy) return;
      const now = performance.now();
      if (now - s.lastAdvance < 120) return;
      s.busy = true;
      s.lastAdvance = now;
      const nextIndex = (s.index + 1) % HERO_IMAGES.length;
      const cur = layers[s.active];
      const next = layers[1 - s.active];
      next.style.backgroundImage = `url("${HERO_IMAGES[nextIndex]}")`;
      cur.classList.remove("hero-bg-layer-active");
      next.classList.remove("hero-bg-layer-active");
      void next.offsetWidth;
      next.classList.add("hero-bg-layer-active");
      s.active = 1 - s.active;
      s.index = nextIndex;
      s.busy = false;
    };

    if (prefersReduced) {
      A.classList.add("hero-bg-layer-active");
      const t = setInterval(goNext, 8000);
      return () => {
        clearInterval(t);
        A.classList.remove("hero-bg-layer-active");
      };
    }

    const onAnimEnd = (e: AnimationEvent) => {
      if (e.animationName !== "hero-bg-kenburns-cycle") return;
      if (e.target !== e.currentTarget) return;
      goNext();
    };
    A.classList.add("hero-bg-layer-active");
    A.addEventListener("animationend", onAnimEnd);
    B.addEventListener("animationend", onAnimEnd);
    return () => {
      A.removeEventListener("animationend", onAnimEnd);
      B.removeEventListener("animationend", onAnimEnd);
      A.classList.remove("hero-bg-layer-active");
      B.classList.remove("hero-bg-layer-active");
    };
  }, [prefersReduced]);

  return (
    /* fixed wrapper — clips Ken Burns overflow, stays behind all content */
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <div ref={layerA} className="hero-bg-layer" />
      <div ref={layerB} className="hero-bg-layer" />
    </div>
  );
}

/* ─── status bar typewriter ─── */
const STATUS_ITEMS = [
  { Icon: CalendarClock, label: "Today", color: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30", text: "6 appointments today!" },
  { Icon: CalendarCheck, label: "Tomorrow", color: "bg-sky-500/20 text-sky-300 border-sky-400/30", text: "3 appointments tomorrow!" },
  { Icon: CalendarRange, label: "Week", color: "bg-violet-500/20 text-violet-300 border-violet-400/30", text: "21 appointments this week!" },
  { Icon: TrendingUp, label: "Month", color: "bg-amber-500/20 text-amber-300 border-amber-400/30", text: "63 appointments this month!" },
] as const;

type StatusItem = typeof STATUS_ITEMS[number];

function useTypewriter(
  items: readonly StatusItem[],
  typeMs = 46,
  deleteMs = 20,
  pauseMs = 1900,
) {
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = items[idx].text;
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx < target.length)
      t = setTimeout(() => setCharIdx((c) => c + 1), typeMs);
    else if (!deleting)
      t = setTimeout(() => setDeleting(true), pauseMs);
    else if (deleting && charIdx > 0)
      t = setTimeout(() => setCharIdx((c) => c - 1), deleteMs);
    else
      t = setTimeout(() => { setDeleting(false); setIdx((i) => (i + 1) % items.length); }, typeMs);
    return () => clearTimeout(t);
  }, [charIdx, deleting, idx, items, typeMs, deleteMs, pauseMs]);

  return { text: items[idx].text.slice(0, charIdx), Icon: items[idx].Icon, label: items[idx].label, color: items[idx].color };
}

/* ─── appointment deck ─── */
const APPOINTMENTS = [
  { id: 1, doctor: "Dr. Carter", specialty: "Cardiology", time: "10:30 AM", status: "Next up", img: "/doctors/img-1.jpg", Icon: HeartPulse, accent: "from-emerald-500/20 to-emerald-500/5", ic: "text-emerald-300", bc: "border-emerald-400/25" },
  { id: 2, doctor: "Dr. Martinez", specialty: "Neurology", time: "2:00 PM", status: "Today", img: "/doctors/img-2.jpg", Icon: Activity, accent: "from-sky-500/20 to-sky-500/5", ic: "text-sky-300", bc: "border-sky-400/25" },
  { id: 3, doctor: "Dr. Kim", specialty: "Dermatology", time: "4:15 PM", status: "Confirmed", img: "/doctors/img-3.jpg", Icon: Sparkles, accent: "from-violet-500/20 to-violet-500/5", ic: "text-violet-300", bc: "border-violet-400/25" },
  { id: 4, doctor: "Dr. Patel", specialty: "Pediatrics", time: "9:00 AM", status: "Tomorrow", img: "/doctors/img-4.jpg", Icon: Users, accent: "from-amber-500/20 to-amber-500/5", ic: "text-amber-300", bc: "border-amber-400/25" },
  { id: 5, doctor: "Dr. Thompson", specialty: "Orthopedics", time: "11:45 AM", status: "Reschedule", img: "/doctors/img-5.jpg", Icon: Stethoscope, accent: "from-rose-500/20 to-rose-500/5", ic: "text-rose-300", bc: "border-rose-400/25" },
  { id: 6, doctor: "Dr. John", specialty: "Endocrinology", time: "3:30 PM", status: "Pending", img: "/doctors/img-6.jpg", Icon: Zap, accent: "from-teal-500/20 to-teal-500/5", ic: "text-teal-300", bc: "border-teal-400/25" },
];

function AppointmentDeck() {
  const [offset, setOffset] = useState(0);
  const layerA = useRef<HTMLDivElement>(null);
  const layerB = useRef<HTMLDivElement>(null);
  const bgState = useRef({ active: 0 });
  const { text: statusText, Icon: StatusIcon, label: statusLabel, color: statusColor } = useTypewriter(STATUS_ITEMS);

  /* advance offset every 3.4 s */
  useEffect(() => {
    const t = setInterval(() => setOffset((o) => (o + 1) % APPOINTMENTS.length), 3400);
    return () => clearInterval(t);
  }, []);

  /* two-layer crossfade + Ken Burns — mirrors HERO_ROTATING_BACKGROUND_SPEC */
  useEffect(() => {
    const A = layerA.current;
    const B = layerB.current;
    if (!A || !B) return;
    const layers = [A, B];
    const s = bgState.current;
    const next = layers[1 - s.active];
    const cur = layers[s.active];
    next.style.backgroundImage = `url("${APPOINTMENTS[offset].img}")`;
    cur.classList.remove("card-bg-layer-active");
    next.classList.remove("card-bg-layer-active");
    void next.offsetWidth; // force reflow — restarts Ken Burns keyframes
    next.classList.add("card-bg-layer-active");
    s.active = 1 - s.active;
  }, [offset]);

  /* 4 visible cards rotating through 6 */
  const cards = [0, 1, 2, 3, 4].map((i) => APPOINTMENTS[(offset + i) % APPOINTMENTS.length]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: false, amount: 0 }}
      transition={{ duration: 0.75, ease, delay: 0.15 }}
      className="relative w-full max-w-[340px] md:max-w-[380px] xl:max-w-[480px] justify-self-center xl:justify-self-end"
    >
      <div className="relative rounded-[28px] border border-white/15 overflow-hidden backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.55)]" style={{ transform: "translateZ(0)", contain: "paint", isolation: "isolate" }}>

        {/* ── crossfade + Ken Burns bg layers ── */}
        <div ref={layerA} aria-hidden className="card-bg-layer pointer-events-none" />
        <div ref={layerB} aria-hidden className="card-bg-layer pointer-events-none" />
        {/* readability overlay */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-slate-950/78" />

        {/* ── content (above bg layers) ── */}
        <div className="relative">

          {/* header */}
          <div className="flex items-center justify-between px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-400/20">
                <Clock className="h-3.5 w-3.5 text-sky-300" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 leading-none">Upcoming</p>
                <p className="text-sm font-semibold text-white leading-snug">Appointments</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {APPOINTMENTS.map((_, i) => (
                <motion.span
                  key={i}
                  animate={{ width: i === offset ? 16 : 6, opacity: i === offset ? 1 : 0.25 }}
                  transition={{ duration: 0.4 }}
                  className="h-1.5 rounded-full bg-sky-400 inline-block"
                />
              ))}
            </div>
          </div>

          {/* shuffling card list — no overflow-hidden here so exit/settle animate freely */}
          <div className="px-6 lg:px-8">
            <AnimatePresence initial={false} mode="popLayout">
              {cards.map((apt, i) => (
                <motion.div
                  key={apt.id}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: -72,
                    scale: 0.88,
                    filter: "blur(6px)",
                    transition: { duration: 0.36, ease: [0.4, 0, 1, 1] },
                  }}
                  transition={{
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                    layout: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className={i === 0 ? "mb-3" : "mb-2"}
                >
                  {/*
                   * Every card gets the settle wrapper — key changes each cycle so all
                   * 4 re-mount and play their nudge. Delay staggers top→bottom so the
                   * spring ripple cascades down through the list.
                   */}
                  <motion.div
                    key={`settle-${offset}-${i}`}
                    initial={{ y: i === 0 ? 12 : 7 - i, opacity: 0.55 }}
                    animate={{
                      y: i === 0 ? [12, -9, 3, -1, 0] : [7 - i, -(6 - i), 2, 0],
                      opacity: [0.55, 1, 1, 1],
                    }}
                    transition={{
                      duration: i === 0 ? 0.62 : 0.5,
                      delay: 0.14 + i * 0.055,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {i === 0 ? (
                      <div className={`rounded-[18px] bg-linear-to-br ${apt.accent} border ${apt.bc} p-4`}>
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.09, 1] }}
                            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/10 ${apt.ic}`}
                          >
                            <apt.Icon className="h-5 w-5" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{apt.doctor}</p>
                            <p className="text-xs text-white/55">{apt.specialty}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-bold ${apt.ic}`}>{apt.time}</p>
                            <span className="inline-block  text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/5 ${apt.ic}`}>
                          <apt.Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white/80 truncate">{apt.doctor}</p>
                          <p className="text-[11px] text-white/40">{apt.specialty} · {apt.time}</p>
                        </div>
                        <CheckCircle2 className="h-3.5 w-3.5 text-white/25 shrink-0" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* status bar — typewriter */}
          <div className="mx-6 lg:mx-8 mb-6 lg:mb-8 flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />

            {/* animated banner pill */}
            <AnimatePresence mode="wait">
              <motion.span
                key={statusLabel}
                /* enter — spring nugget: zooms in overshooting, shakes into place */
                initial={{ opacity: 0, scale: 0.3, rotate: -8 }}
                animate={{
                  opacity: [0, 1, 1, 1, 1, 1],
                  scale: [0.3, 1.28, 0.88, 1.10, 0.97, 1],
                  rotate: [-8, 4, -3, 2, -1, 0],
                }}
                /* exit — smooth ease-out shrink + fade */
                exit={{ opacity: 0, scale: 0.6, rotate: 6, filter: "blur(3px)", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
                transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-flex shrink-0 items-center gap-1 rounded-3xl border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${statusColor}`}
              >
                <StatusIcon className="h-2.5 w-2.5" />
                {statusLabel}
              </motion.span>
            </AnimatePresence>

            {/* typewriter text + blinking cursor */}
            <p className="text-xs text-white/65 font-mono tracking-tight min-w-0 flex-1 truncate">
              {statusText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.75, repeat: Infinity }}
                className="inline-block w-[1.5px] h-[10px] bg-white/55 ml-[2px] align-middle rounded-sm"
              />
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

/* ─── static data ─── */
const FEATURES = [
  { Icon: CalendarDays, title: "Multi-view calendar", desc: "Switch effortlessly between List, Day, Week and Month views to see exactly what matters.", from: "from-sky-500/20 via-sky-500/10 to-sky-500/5", border: "border-sky-400/30", shadow: "shadow-[0_20px_60px_rgba(2,132,199,0.25)]" },
  { Icon: Stethoscope, title: "Doctor & patient management", desc: "Manage healthcare records, categories, appointment types and invoices from a single control panel.", from: "from-emerald-500/20 via-emerald-500/10 to-emerald-500/5", border: "border-emerald-400/30", shadow: "shadow-[0_20px_60px_rgba(16,185,129,0.22)]" },
  { Icon: Bell, title: "Smart reminders", desc: "Automatic email reminders and real-time notifications keep everyone in sync.", from: "from-amber-500/20 via-amber-500/10 to-amber-500/5", border: "border-amber-400/30", shadow: "shadow-[0_20px_60px_rgba(245,158,11,0.2)]" },
  { Icon: Users, title: "Team invitations", desc: "Invite doctors and staff with granular roles and permissions in seconds.", from: "from-violet-500/20 via-violet-500/10 to-violet-500/5", border: "border-violet-400/30", shadow: "shadow-[0_20px_60px_rgba(139,92,246,0.25)]" },
  { Icon: ShieldCheck, title: "Secure by default", desc: "Server-side proxy auth, strict CSP, and encrypted sessions protect every request.", from: "from-rose-500/20 via-rose-500/10 to-rose-500/5", border: "border-rose-400/30", shadow: "shadow-[0_20px_60px_rgba(225,29,72,0.25)]" },
  { Icon: BarChart3, title: "Insights & analytics", desc: "Real-time dashboards reveal appointment trends, revenue, and patient outcomes.", from: "from-blue-500/20 via-blue-500/10 to-blue-500/5", border: "border-blue-400/30", shadow: "shadow-[0_20px_60px_rgba(59,130,246,0.25)]" },
];

const STATS = [
  { label: "Views", value: "4", sub: "List · Day · Week · Month" },
  { label: "Integrations", value: "10+", sub: "Stripe · Google · AI" },
  { label: "Roles", value: "Full", sub: "RBAC & invitations" },
  { label: "Realtime", value: "Live", sub: "SSE notifications" },
];

const HIGHLIGHTS = [
  {
    Icon: Activity,
    text: "Real-time notifications",
    desc: "Live SSE stream delivers instant alerts for bookings, cancellations, and reminders — no polling.",
    iconColor: "text-emerald-400",
    iconBorder: "border-emerald-400/30",
    iconBg: "bg-emerald-400/10",
    glow: "rgba(16,185,129,0.12)",
  },
  {
    Icon: Clock,
    text: "Google Calendar sync",
    desc: "Two-way sync keeps your Google Calendar and HealthCal Pro in perfect alignment, always.",
    iconColor: "text-sky-400",
    iconBorder: "border-sky-400/30",
    iconBg: "bg-sky-400/10",
    glow: "rgba(56,189,248,0.12)",
  },
  {
    Icon: HeartPulse,
    text: "Telehealth video calls",
    desc: "Launch secure video consultations directly from any appointment — no third-party app needed.",
    iconColor: "text-rose-400",
    iconBorder: "border-rose-400/30",
    iconBg: "bg-rose-400/10",
    glow: "rgba(251,113,133,0.12)",
  },
  {
    Icon: Zap,
    text: "AI appointment parsing",
    desc: "Paste any free-text request and AI extracts patient, time, doctor, and category automatically.",
    iconColor: "text-amber-400",
    iconBorder: "border-amber-400/30",
    iconBg: "bg-amber-400/10",
    glow: "rgba(251,191,36,0.12)",
  },
];

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const prefersReduced = useReducedMotion();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [navScrolled, setNavScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [aboutCardIdx, setAboutCardIdx] = useState(0);
  // Track which demo account is selected; defaults to admin (index 0).
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(0);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setAboutCardIdx((i) => (i + 1) % ABOUT_CARDS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDemo = useCallback(async () => {
    setDemoLoading(true);
    const account = DEMO_ACCOUNTS[selectedDemoIdx];
    try {
      // Use the standard login endpoint — works in all environments without feature flags.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: account.email, password: DEMO_PASSWORD }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          queryClient.setQueryData(queryKeys.auth.me, { ...data.user, email_verified: true });
          const payload = JSON.stringify({
            name: data.user.display_name || data.user.email?.split("@")[0] || "there",
            todayCount: Number(data.today_appointments ?? 0),
          });
          sessionStorage.setItem("post-login-toast", payload);
          localStorage.setItem("post-login-toast", payload);
          // Route patients to the patient portal; all other roles use the dashboard.
          const dest = data.user.role === "patient" ? "/patient-portal" : "/dashboard";
          // Do NOT reset loading here — keep spinner visible until the new page mounts.
          // router.push is async; resetting before unmount causes a brief button flash.
          router.push(dest);
          return;
        }
      }
      // Only reach here on non-ok response or missing user — reset loading for retry.
      setDemoLoading(false);
      notify.error({ title: "Demo login failed", subtitle: "Could not start the demo session. Please try again." });
    } catch {
      setDemoLoading(false);
      notify.error({ title: "Demo login failed", subtitle: "Could not start the demo session. Please try again." });
    }
  }, [router, queryClient, selectedDemoIdx]);

  return (
    <div className="relative min-h-screen text-white">

      {/* ── Fixed rotating background (full viewport, behind everything) ── */}
      <HeroBackground prefersReduced={prefersReduced} />

      {/* ── Fixed global dark overlay (visible through all sections) ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(135deg, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.78) 45%, rgba(2,6,23,0.68) 100%)",
        }}
      />
      {/* colour accent glows */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(circle at 20% 60%, rgba(59,130,246,0.12), transparent 55%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.08), transparent 50%)",
        }}
      />

      {/* ── Fixed navbar ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled
          ? "bg-transparent backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <CalendarDays className="h-[18px] w-[18px] text-white" />
            </span>
            <span className="text-base font-semibold tracking-tight">HealthCal Pro</span>
          </Link>

          <nav className="hidden gap-8 text-sm text-white/70 md:flex">
            {(["Features", "Highlights", "About"] as const).map((label) => (
              <button
                key={label}
                onClick={() => scrollTo(label.toLowerCase())}
                className="cursor-pointer transition hover:text-white"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
            >
              <User className="h-3.5 w-3.5" />
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-500/70 via-blue-500/50 to-blue-500/30 px-4 py-2 text-sm font-semibold shadow-[0_8px_25px_rgba(59,130,246,0.4)] backdrop-blur-sm transition hover:from-blue-500/80"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════ HERO ════════════════════ */}
      {/*
        No background or overflow-hidden needed here — the fixed bg
        layers behind show through this transparent section.
      */}
      <section className="relative z-10 min-h-screen">
        <div className="mx-auto grid w-full max-w-[1440px] min-h-screen grid-cols-1 items-center gap-12 px-6 pt-28 pb-16 lg:grid-cols-2 lg:px-10 lg:pt-32 lg:pb-20">

          {/* Left: text + CTAs */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0 }}
            className="flex flex-col gap-6"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm"
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              Modern healthcare scheduling
            </motion.div>

            {/* h1 — uses parent stagger/fadeUp so it is always visible on load */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl font-black leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[3.5rem] xl:text-6xl"
            >
              Calendar appointments,{" "}
              <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                reimagined
              </span>{" "}
              for healthcare teams.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="max-w-lg text-base leading-relaxed text-white/70 md:text-lg"
            >
              A fullstack platform for clinics and hospitals — schedule patients, send reminders,
              and analyze operations from one beautifully crafted dashboard.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl border border-blue-400/40 bg-gradient-to-r from-blue-500/80 via-blue-500/60 to-blue-500/40 px-6 py-3 text-sm font-semibold shadow-[0_15px_35px_rgba(59,130,246,0.45)] backdrop-blur-sm transition hover:from-blue-500/90"
              >
                <UserPlus className="h-4 w-4" />
                Create free account
              </Link>

              {/* Demo account CTA — dropdown to select role + one-click login */}
              <motion.div
                initial={{ scale: 0.3, rotate: -8, opacity: 0 }}
                whileInView={{
                  scale: [0.3, 1.26, 0.88, 1.08, 0.97, 1],
                  rotate: [-8, 5, -3, 2, -1, 0],
                  opacity: [0, 1, 1, 1, 1, 1],
                }}
                viewport={{ once: false, amount: 0.6 }}
                transition={{ duration: 0.62, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-2"
              >
                {/* Role selector — choose which demo account to sign in with */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    {/* Match height of CTA buttons: text-sm + py-3 */}
                    <button
                      type="button"
                      disabled={demoLoading}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-400/40 bg-emerald-900/40 px-4 py-3 text-sm font-medium text-emerald-100 backdrop-blur-sm transition hover:bg-emerald-800/50 disabled:opacity-60 cursor-pointer"
                    >
                      {/* Role-specific icon beside the selected account label */}
                      {DEMO_ACCOUNTS[selectedDemoIdx].role === "admin" && <ShieldCheck className="h-4 w-4 opacity-80" />}
                      {DEMO_ACCOUNTS[selectedDemoIdx].role === "doctor" && <Stethoscope className="h-4 w-4 opacity-80" />}
                      {DEMO_ACCOUNTS[selectedDemoIdx].role === "patient" && <HeartPulse className="h-4 w-4 opacity-80" />}
                      {DEMO_ACCOUNTS[selectedDemoIdx].label}
                      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[160px]" sideOffset={6}>
                    {DEMO_ACCOUNTS.map((acc, idx) => (
                      <DropdownMenuItem
                        key={acc.email}
                        onSelect={() => setSelectedDemoIdx(idx)}
                        className={`gap-2 ${idx === selectedDemoIdx ? "bg-emerald-50 text-emerald-700" : ""}`}
                      >
                        {acc.role === "admin" && <ShieldCheck className="h-4 w-4 shrink-0" />}
                        {acc.role === "doctor" && <Stethoscope className="h-4 w-4 shrink-0" />}
                        {acc.role === "patient" && <HeartPulse className="h-4 w-4 shrink-0" />}
                        {acc.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/*
                 * overflow-hidden clips the ripple effect to the rounded corners,
                 * preventing the extra visible border that appeared around the button.
                 */}
                <div
                  className="cta-shine-wrap overflow-hidden rounded-2xl transition-shadow duration-300"
                  style={{ boxShadow: "0 12px 32px rgba(16,185,129,0.5), 0 0 28px rgba(16,185,129,0.28)" }}
                >
                  <RippleButton
                    onClick={handleDemo}
                    disabled={demoLoading}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/55 bg-gradient-to-r from-emerald-500/80 via-emerald-500/65 to-emerald-600/50 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:from-emerald-700/90 hover:to-emerald-500/60 disabled:opacity-60 cursor-pointer"
                  >
                    {demoLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing In... <ArrowRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Try Demo Account <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </RippleButton>
                </div>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={stagger} className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {STATS.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-black text-white">{s.value}</p>
                  <p className=" text-[10px] leading-snug text-white/70">{s.sub}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: appointment deck */}
          <AppointmentDeck />
        </div>
      </section>

      {/* ════════════════════ HIGHLIGHTS ════════════════════ */}
      <section id="highlights" className="relative z-10 py-20 lg:py-28">
        <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-10">

          {/* ── section header ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="mb-12 flex flex-col items-center gap-4 text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-300 backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Platform Highlights
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
              Everything your practice needs,{" "}
              <span className="bg-linear-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">out of the box.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="max-w-xl text-base text-white/55">
              Four capabilities that set HealthCal Pro apart from legacy scheduling tools.
            </motion.p>
          </motion.div>

          {/* ── cards grid ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {HIGHLIGHTS.map(({ Icon, text, desc, iconColor, iconBorder, iconBg, glow }, i) => (
              <motion.div
                key={text}
                variants={fadeUp}
                className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-white/20 hover:bg-white/8"
                style={{ boxShadow: `0 0 40px ${glow}, inset 0 1px 0 rgba(255,255,255,0.05)` }}
              >
                {/* icon */}
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${iconBorder} ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </span>

                {/* text */}
                <div>
                  <p className="text-base font-semibold text-white">{text}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">{desc}</p>
                </div>

                {/* subtle number */}
                <span className="absolute bottom-5 right-5 text-[2.5rem] font-black leading-none text-white/[0.04] select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ════════════════════ FEATURES ════════════════════ */}
      <section
        id="features"
        className="relative z-10"

      >
        <div className="mx-auto w-full max-w-[1440px] px-6 py-20 lg:px-10 lg:py-28">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.25 }}
            className="mx-auto max-w-2xl text-center mb-14"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-sky-300 backdrop-blur-sm"
            >
              <LayoutGrid className="h-3 w-3" />
              Features
            </motion.div>
            <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
              Everything a modern{" "}
              <span className="bg-linear-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">clinic needs.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-xl text-base text-white/55">
              Built with Next.js, PostgreSQL, Prisma and TanStack Query — production-grade performance with delightful UX.
            </motion.p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {FEATURES.map(({ Icon, title, desc, from, border, shadow }) => (
              <motion.article
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.22 } }}
                className={`rounded-[28px] border ${border} bg-gradient-to-br ${from} p-6 ${shadow} backdrop-blur-md`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ ABOUT ════════════════════ */}
      <section
        id="about"
        className="relative z-10"
      >
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">

          {/* Left: text */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            className="flex flex-col gap-6"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-emerald-300 backdrop-blur-sm"
            >
              <Building2 className="h-3 w-3" />
              About
            </motion.div>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              <StairLines
                lines={["A production-ready platform", "crafted for real", "healthcare workflows."]}
              />
            </h2>

            <div className="space-y-3 text-sm leading-relaxed text-white/70">
              {[
                "HealthCal Pro is a modern fullstack showcase combining a premium design system with a solid backend. Server-side auth, role-based access, realtime notifications, AI assistance and an extensible control panel ship out of the box.",
                "Whether you run a small clinic or a multi-location hospital, the application scales with your workflow — from single-provider scheduling to organization-wide oversight with granular permissions.",
                "Built with security headers, bot protection, Vercel production guardrails and edge-level proxy authentication for zero-flash navigation.",
              ].map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500/70 via-emerald-500/50 to-emerald-500/30 px-5 py-2.5 text-sm font-semibold shadow-[0_15px_35px_rgba(16,185,129,0.32)] backdrop-blur-sm transition hover:from-emerald-500/80"
              >
                <Zap className="h-4 w-4" />
                Start your trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
              >
                <User className="h-4 w-4" />
                I have an account
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.65, ease }}
            className="relative w-full max-w-md mx-auto"
          >
            {/* outer glow layers */}
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[44px] blur-2xl opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 70%, rgba(16,185,129,0.55) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.45) 0%, transparent 60%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -inset-1 rounded-[36px] blur-xl opacity-30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.6) 0%, rgba(59,130,246,0.5) 50%, rgba(139,92,246,0.4) 100%)",
              }}
            />

            {/* image carousel */}
            <div
              className="relative aspect-4/5 w-full overflow-hidden rounded-[32px] border border-white/15"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.55), 0 0 50px rgba(16,185,129,0.18), 0 0 90px rgba(59,130,246,0.12)",
              }}
            >
              {/* sliding cards */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={aboutCardIdx}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <SafeImage
                    src={ABOUT_CARDS[aboutCardIdx].img}
                    alt={ABOUT_CARDS[aboutCardIdx].title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/92 via-slate-950/25 to-transparent" />

                  {/* bottom info pill */}
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-slate-900/80 p-4 backdrop-blur-xl">
                    <div className="flex items-stretch gap-2">
                      <span className={`flex w-10 shrink-0 self-stretch items-center justify-center rounded-2xl border ${ABOUT_CARDS[aboutCardIdx].iconBorder} ${ABOUT_CARDS[aboutCardIdx].iconBg}`}>
                        {React.createElement(ABOUT_CARDS[aboutCardIdx].Icon, {
                          className: `h-3.5 w-3.5 ${ABOUT_CARDS[aboutCardIdx].iconColor}`,
                        })}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{ABOUT_CARDS[aboutCardIdx].title}</p>
                        <p className=" text-xs text-white/55">{ABOUT_CARDS[aboutCardIdx].desc}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* dot indicators */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                {ABOUT_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setAboutCardIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === aboutCardIdx
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/35 hover:bg-white/60"
                      }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ FOOTER ════════════════════ */}
      <footer
        className="relative z-10"

      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-7 text-sm text-white/70 md:flex-row lg:px-10">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span className=" text-white/70">HealthCal Pro</span>
            <span className="text-white/70">·</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => scrollTo("features")} className="cursor-pointer transition hover:text-white">Features</button>
            <button onClick={() => scrollTo("highlights")} className="cursor-pointer transition hover:text-white">Highlights</button>
            <button onClick={() => scrollTo("about")} className="cursor-pointer transition hover:text-white">About</button>
            <Link href="/login" className="transition hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
