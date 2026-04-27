"use client";

import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Hand,
  Info,
  LucideIcon,
  Trash2,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NotifyVariant = "success" | "info" | "warning" | "error";

type NotifyPayload = {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  duration?: number;
};

const variantStyles: Record<
  NotifyVariant,
  { shell: string; iconWrap: string; iconColor: string; fallbackIcon: LucideIcon }
> = {
  success: {
    shell:
      "border-emerald-400/35 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-950 shadow-[0_16px_40px_rgba(16,185,129,0.22)]",
    iconWrap: "bg-emerald-100/85 border-emerald-300/60",
    iconColor: "text-emerald-700",
    fallbackIcon: CheckCircle2,
  },
  info: {
    shell:
      "border-sky-400/35 bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-sky-500/5 text-sky-950 shadow-[0_16px_40px_rgba(2,132,199,0.2)]",
    iconWrap: "bg-sky-100/85 border-sky-300/60",
    iconColor: "text-sky-700",
    fallbackIcon: Info,
  },
  warning: {
    shell:
      "border-amber-400/35 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/5 text-amber-950 shadow-[0_16px_40px_rgba(245,158,11,0.2)]",
    iconWrap: "bg-amber-100/85 border-amber-300/60",
    iconColor: "text-amber-700",
    fallbackIcon: AlertTriangle,
  },
  error: {
    shell:
      "border-rose-400/35 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-rose-500/5 text-rose-950 shadow-[0_16px_40px_rgba(225,29,72,0.2)]",
    iconWrap: "bg-rose-100/85 border-rose-300/60",
    iconColor: "text-rose-700",
    fallbackIcon: XCircle,
  },
};

function RichToast({
  variant,
  title,
  subtitle,
  icon,
}: {
  variant: NotifyVariant;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
}) {
  const styles = variantStyles[variant];
  const Icon = icon ?? styles.fallbackIcon;

  return (
    <div className={cn("w-full rounded-2xl border p-3 backdrop-blur-sm", styles.shell)}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-xl border",
            styles.iconWrap
          )}
        >
          <Icon className={cn("size-4", styles.iconColor)} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{title}</p>
          <p className="mt-1 text-xs leading-snug opacity-90">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function showRichToast(variant: NotifyVariant, payload: NotifyPayload) {
  return toast.custom(
    (id) => (
      <div onClick={() => toast.dismiss(id)}>
        <RichToast
          variant={variant}
          title={payload.title}
          subtitle={payload.subtitle}
          icon={payload.icon}
        />
      </div>
    ),
    { duration: payload.duration ?? 4500 }
  );
}

export const notify = {
  success: (payload: NotifyPayload) => showRichToast("success", payload),
  info: (payload: NotifyPayload) => showRichToast("info", payload),
  warning: (payload: NotifyPayload) => showRichToast("warning", payload),
  error: (payload: NotifyPayload) => showRichToast("error", payload),
  loginWelcome: ({ name, todayCount }: { name: string; todayCount: number }) =>
    showRichToast("success", {
      title: `Welcome back, ${name}`,
      subtitle: `Enjoy your day — you have ${todayCount} appointment${todayCount === 1 ? "" : "s"} today.`,
      icon: Hand,
    }),
  logoutGoodbye: ({ name }: { name: string }) =>
    showRichToast("info", {
      title: `Goodbye for now, ${name}`,
      subtitle: "Hope to see you soon.",
      icon: Hand,
    }),
  crud: ({
    action,
    entity,
    detail,
  }: {
    action: "created" | "updated" | "deleted" | "imported";
    entity: string;
    detail: string;
  }) => {
    const isDelete = action === "deleted";
    const icon: LucideIcon | undefined = isDelete ? Trash2 : undefined;
    const variant: NotifyVariant = isDelete ? "warning" : "success";

    return showRichToast(variant, {
      title: `${entity} ${action}`,
      subtitle: detail,
      icon,
    });
  },
};

export type { NotifyPayload, NotifyVariant };
