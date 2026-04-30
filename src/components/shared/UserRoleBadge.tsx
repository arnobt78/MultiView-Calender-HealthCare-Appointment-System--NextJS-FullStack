"use client";

import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Stethoscope, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRoleBadgeProps = {
  role?: string | null;
  className?: string;
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const normalized = (role ?? "").toLowerCase();

  // Centralized role presentation keeps icon/color semantics consistent.
  const map = {
    admin: {
      label: "Admin",
      icon: ShieldCheck,
      styles:
        "border-indigo-300/70 bg-indigo-50 text-indigo-700",
    },
    doctor: {
      label: "Doctor",
      icon: Stethoscope,
      styles:
        "border-emerald-300/70 bg-emerald-50 text-emerald-700",
    },
    patient: {
      label: "Patient",
      icon: User,
      styles:
        "border-sky-300/70 bg-sky-50 text-sky-700",
    },
    secretary: {
      label: "Secretary",
      icon: Users,
      styles:
        "border-amber-300/70 bg-amber-50 text-amber-700",
    },
  } as const;

  const entry = map[normalized as keyof typeof map];
  if (!entry) {
    return (
      <Badge
        variant="outline"
        className={cn("capitalize text-xs", className)}
      >
        {role ?? "—"}
      </Badge>
    );
  }

  const Icon = entry.icon;
  return (
    <Badge
      variant="outline"
      className={cn("inline-flex items-center gap-1.5 text-xs", entry.styles, className)}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {entry.label}
    </Badge>
  );
}

