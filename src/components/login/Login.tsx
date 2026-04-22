"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  Clock,
  Users,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  Bell,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

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

const testAccounts: Record<string, { email: string; password: string; label: string }> = {
  "guest-user": {
    email: "test@user.com",
    password: "12345678",
    label: "Guest User",
  },
};

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
  const router = useRouter();
  const queryClient = useQueryClient();

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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        return;
      }

      if (data.user) {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
        toast.success(`Welcome back, ${data.user.email}!`);

        if (redirect) {
          window.location.href = redirect;
          return;
        }
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "An error occurred during login";
      toast.error(message);
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
      <div className="relative z-10 flex h-full">

        {/* ── Left info panel ── */}
        <div className="hidden lg:flex flex-1 flex-col justify-center px-12 xl:px-20 py-10 text-white overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-8">
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

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.25 + i * 0.06 }}
                className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/[0.14] transition-colors duration-200"
              >
                <div className="shrink-0 p-1.5 bg-blue-400/25 rounded-md">
                  <Icon className="h-3.5 w-3.5 text-blue-200" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/90 leading-snug">{title}</p>
                  <p className="text-[11px] text-blue-200/60 leading-relaxed hidden xl:block mt-0.5">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-8 text-xs text-white/25"
          >
            Built with Next.js 16 · TypeScript · Prisma · PostgreSQL · TailwindCSS
          </motion.p>
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
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
              </motion.div>

              <motion.form
                onSubmit={handleLogin}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-role" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                    Test Accounts To Login With
                  </Label>
                  <Select
                    key={`select-${selectedRole || "empty"}`}
                    value={selectedRole || undefined}
                    onValueChange={handleRoleSelect}
                  >
                    <SelectTrigger
                      id="login-role"
                      className="w-full h-11 bg-slate-50 border-slate-200 rounded-md text-base focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                    >
                      <SelectValue placeholder="Select Role Based Test Account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest-user">Guest User (test@user.com)</SelectItem>
                      {selectedRole && (
                        <SelectItem value="clear" className="text-muted-foreground">
                          Clear Selection
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                    className="h-11 bg-slate-50 border-slate-200 rounded-md text-base focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                  />
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
                    className="h-11 bg-slate-50 border-slate-200 rounded-md text-base focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                  />
                </div>

                <div className="pt-1 space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-md font-semibold text-sm bg-blue-600 hover:bg-blue-700 transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 rounded-md font-medium text-sm border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
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
                <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
