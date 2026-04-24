"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
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
} from "lucide-react";
import { motion } from "framer-motion";

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

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, display_name: name.trim() || undefined }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success(data.message || "Account created! Check your email to verify.");
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : "An error occurred during registration";
      toast.error(message);
    }
  };

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ background: "linear-gradient(to right, #042f2e, #022c22, #0f172a)" }}
    >
      <Image
        src="/images/img5.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-950/92 via-emerald-950/80 to-slate-900/40" />

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
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md border border-white/20">
                  <CalendarDays className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">HealthCal Pro</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black leading-none tracking-tight mb-4">
                Join the Modern
                <br />
                <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Healthcare Platform
                </span>
              </h1>
              <p className="text-teal-100/75 text-sm xl:text-base leading-relaxed mb-8">
                Create your account and gain access to a powerful appointment management
                system designed for healthcare providers of all sizes.
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
                  <div className="shrink-0 p-1.5 bg-teal-400/25 rounded-2xl">
                    <Icon className="h-3.5 w-3.5 text-teal-200" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/90 leading-snug">{title}</p>
                    <p className="text-[11px] text-teal-200/60 leading-relaxed hidden xl:block mt-0.5">{description}</p>
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
              <div className="bg-gradient-to-br from-white via-slate-50/95 to-teal-100/80 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] ring-1 ring-white/50 px-8 py-8">

                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="mb-6"
                >
                  <div className="inline-flex p-2.5 bg-teal-50 rounded-2xl mb-4 ring-1 ring-teal-100">
                    <CalendarDays className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-700 tracking-tight">Create account</h2>
                  <p className="text-slate-400 text-sm mt-1">Join HealthCal Pro to manage your appointments</p>
                </motion.div>

                <motion.form
                  onSubmit={handleRegister}
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="register-name" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-base focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="register-email" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Email Address
                    </Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-base focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="register-password" className="text-slate-500 text-xs font-semibold uppercase tracking-wide">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-11 bg-slate-50 border-slate-200 rounded-2xl text-base focus-visible:ring-teal-500/30 focus-visible:border-teal-400"
                    />
                  </div>

                  <div className="pt-1">
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-2xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 transition-colors"
                      disabled={loading}
                    >
                      {loading ? "Creating account…" : "Create Account"}
                    </Button>
                  </div>
                </motion.form>

                <p className="text-center mt-5 text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
                    Sign in
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

