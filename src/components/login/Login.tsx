"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { SafeImage } from "@/components/ui/safe-image";
import { notify } from "@/lib/notify";
import { z } from "zod";
import { loginRequestSchema } from "@/lib/schemas/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CalendarDays,
  Clock,
  Users,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  Bell,
  Globe,
  Home,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-credentials";
import { resolveRoleHomeHref } from "@/lib/role-home-href";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const testAccounts: Record<
  string,
  { email: string; password: string; label: string; displayName: string; avatarUrl: string }
> =
  Object.fromEntries(
    DEMO_ACCOUNTS.map((a) => [
      `demo-${a.role}`,
      {
        email: a.email,
        password: DEMO_PASSWORD,
        label: a.label,
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
      },
    ])
  ) as Record<
    string,
    { email: string; password: string; label: string; displayName: string; avatarUrl: string }
  >;

const features = [
  {
    icon: CalendarDays,
    title: "Multi-View Calendar",
    description: "Day, week, and month views for complete schedule visibility.",
  },
  {
    icon: Stethoscope,
    title: "Doctor & Patient Management",
    description: "Manage patient records, doctor profiles, and appointments in one place.",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "AI-assisted appointment parsing and time-slot suggestions.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Instant alerts for appointment changes, reminders, and updates.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Detailed reports on appointment trends and clinic performance.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions for admins, doctors, staff, and patients.",
  },
  {
    icon: Globe,
    title: "Google Calendar Sync",
    description: "Two-way sync with Google Calendar to keep schedules in harmony.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Compliant",
    description: "End-to-end security with encrypted data and audit logs.",
  },
];

type LoginProps = {
  redirect?: string | null;
};

export default function Login({ redirect = null }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedAccount = selectedRole ? testAccounts[selectedRole] : null;

  const handleRoleSelect = (value: string) => {
    if (value === "clear") {
      setSelectedRole("");
      setEmail("");
      setPassword("");
      return;
    }
    setSelectedRole(value);
    const account = testAccounts[value];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsed = loginRequestSchema.safeParse({ email, password });
      if (!parsed.success) {
        // z.flattenError is the Zod v4 replacement for the deprecated err.flatten()
        const fieldErrors = z.flattenError(parsed.error).fieldErrors;
        setErrors({
          email: fieldErrors.email?.[0],
          password: fieldErrors.password?.[0],
        });
        notify.error({
          title: "Invalid login details",
          subtitle: "Please fix the highlighted fields and try again.",
        });
        setLoading(false);
        return;
      }

      setErrors({});
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        // Reset loading on error so the user can retry.
        setLoading(false);
        notify.error({
          title: "Login failed",
          subtitle: data.error || "Please check your credentials and try again.",
        });
        return;
      }

      if (data.user) {
        const payload = {
          name: data.user.display_name || data.user.email?.split("@")[0] || "there",
          todayCount: Number(data.today_appointments ?? 0),
        };
        const serialized = JSON.stringify(payload);
        sessionStorage.setItem("post-login-toast", serialized);
        localStorage.setItem("post-login-toast", serialized);
        /* seed the auth cache so AuthShell sees isAuthenticated=true immediately */
        queryClient.setQueryData(queryKeys.auth.me, { ...data.user, email_verified: true });
        const dest = resolveRoleHomeHref(data.user?.role, redirect);
        // Do NOT reset loading here — keep spinner visible until the new page mounts.
        // Resetting before unmount causes a brief button flash during navigation.
        router.push(dest);
        return;
      }
      // Fallback: unexpected shape — reset so form is interactive again.
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "An error occurred during login";
      notify.error({
        title: "Unable to login",
        subtitle: message,
      });
    }
  };

  const handleGoogle = () => {
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
    window.location.href = `/api/auth/google${redirectParam}`;
  };

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ background: "linear-gradient(to right, #020617, #172554, #0f172a)" }}
    >
      <Image
        src="/images/img1.avif"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/92 via-blue-950/80 to-slate-900/40" />

      {/* Layout */}
      <div className="relative z-10 flex flex-col h-full w-full max-w-[1440px] mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80 tracking-tight">HealthCal Pro</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm transition hover:border-white/30 hover:text-white shadow-xl"
          >
            <Home className="h-3.5 w-3.5" />
            Return home
          </Link>
        </div>

        {/* Main two-column row */}
        <div className="flex flex-1 min-h-0">

          {/* ── Left info panel ── */}
          <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 py-10 text-white overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-8">
                <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">HealthCal Pro</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black leading-none tracking-tight mb-4">
                Modern Healthcare
                <br />
                <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Appointment System
                </span>
              </h1>
              <p className="text-blue-100/75 text-sm xl:text-base leading-relaxed mb-8">
                A full-featured, multi-view calendar platform built for clinics, hospitals,
                and healthcare providers — all in one place.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-2">
              {features.map(({ icon: Icon, title, description }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: 0.25 + i * 0.06 }}
                  className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/[0.14] transition-colors duration-200"
                >
                  <div className="shrink-0 p-1.5 bg-blue-400/25 rounded-2xl">
                    <Icon className="h-3.5 w-3.5 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/90 leading-snug">{title}</p>
                    <p className="text-[11px] text-blue-200/60 leading-relaxed hidden xl:block ">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>


          </div>

          {/* ── Right form panel ── */}
          <div className="flex w-full lg:w-[460px] xl:w-[500px] shrink-0 items-center justify-center px-5 py-8 overflow-y-auto">
            <motion.div
              className="w-full max-w-sm"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              <div className="bg-gradient-to-br from-white via-slate-50/95 to-blue-100/80 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] ring-1 ring-white/50 px-8 py-8">

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="inline-flex p-2.5 bg-blue-50 rounded-2xl mb-4 ring-1 ring-blue-100">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-700 tracking-tight">Welcome back</h2>
                  <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
                </motion.div>

                <motion.form
                  onSubmit={handleLogin}
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="flex flex-col gap-2">
                    <Label className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Test Accounts To Login With
                    </Label>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full h-11 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-left shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-400 cursor-pointer"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            {selectedAccount ? (
                              // Role splash image improves quick visual switching between personas.
                              <SafeImage
                                src={selectedAccount.avatarUrl}
                                alt={selectedAccount.displayName}
                                width={20}
                                height={20}
                                className="size-5 rounded-full object-cover ring-1 ring-slate-300/70"
                              />
                            ) : null}
                            <span
                              className={selectedRole ? "truncate text-gray-700" : "truncate text-slate-400"}
                            >
                              {selectedRole
                                ? `${selectedAccount?.displayName} (${selectedAccount?.email})`
                                : "Select Role Based Test Account"}
                            </span>
                          </span>
                          <ChevronDown className="size-4 shrink-0 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]" sideOffset={4}>
                        {/* One row per `DEMO_ACCOUNTS` entry — stays correct when new demo personas are added. */}
                        {DEMO_ACCOUNTS.map((acc) => (
                          <DropdownMenuItem key={acc.email} onSelect={() => handleRoleSelect(`demo-${acc.role}`)}>
                            <span className="flex items-center gap-2">
                              <SafeImage
                                src={acc.avatarUrl}
                                alt={acc.displayName}
                                width={20}
                                height={20}
                                className="size-5 rounded-full object-cover ring-1 ring-slate-300/70"
                              />
                              {acc.displayName} ({acc.email})
                            </span>
                          </DropdownMenuItem>
                        ))}
                        {selectedRole && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleRoleSelect("clear")}
                              className="text-muted-foreground"
                            >
                              Clear Selection
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login-email" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-base focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                      aria-invalid={Boolean(errors.email)}
                    />
                    {errors.email ? <p className="text-xs font-medium text-rose-600">{errors.email}</p> : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="login-password" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-base focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                      aria-invalid={Boolean(errors.password)}
                    />
                    {errors.password ? <p className="text-xs font-medium text-rose-600">{errors.password}</p> : null}
                  </div>

                  <div className="pt-1 space-y-3">
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-2xl text-white font-semibold text-sm from-sky-500 to-sky-700 bg-gradient-to-r hover:from-sky-600 hover:to-sky-800 transition-colors"
                      disabled={loading}
                    >
                      {loading ? "Signing in…" : "Sign In"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 rounded-2xl font-medium text-sm border-slate-200 bg-white hover:bg-slate-50 text-gray-700"
                      onClick={handleGoogle}
                      disabled={loading}
                    >
                      <GoogleIcon className="mr-2 h-4 w-4 shrink-0" />
                      {loading ? "Redirecting…" : "Continue with Google"}
                    </Button>
                  </div>
                </motion.form>

                <p className="text-center mt-5 text-sm text-slate-400">
                  No account yet?{" "}
                  <Link href="/register" className="text-sky-600 font-semibold hover:text-sky-700 transition-colors">
                    Create one
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>

        </div>{/* end two-column row */}
      </div>
    </div>
  );
}
