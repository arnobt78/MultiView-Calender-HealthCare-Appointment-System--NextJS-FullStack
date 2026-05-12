"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type ConfirmVariant = "destructive" | "warning" | "info";

type ConfirmActionDialogProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  /** Plain text or JSX (e.g. wrap name/email in `font-medium`) */
  subtitle: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: LucideIcon;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
};

const stylesByVariant: Record<ConfirmVariant, { media: string; icon: string; action: string }> = {
  destructive: {
    media:
      "border border-rose-300/55 bg-gradient-to-br from-rose-500/25 via-rose-500/12 to-rose-500/8 shadow-[0_18px_40px_rgba(225,29,72,0.22)]",
    icon: "text-rose-700",
    action:
      "border border-rose-400/55 bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-[0_14px_34px_rgba(225,29,72,0.3)] hover:from-rose-600/95 hover:to-rose-700/95",
  },
  warning: {
    media:
      "border border-amber-300/55 bg-gradient-to-br from-amber-500/25 via-amber-500/12 to-amber-500/8 shadow-[0_18px_40px_rgba(245,158,11,0.22)]",
    icon: "text-amber-700",
    action:
      "border border-amber-400/55 bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-[0_14px_34px_rgba(245,158,11,0.28)] hover:from-amber-500/95 hover:to-amber-600/95",
  },
  info: {
    media:
      "border border-sky-300/55 bg-gradient-to-br from-sky-500/25 via-sky-500/12 to-sky-500/8 shadow-[0_18px_40px_rgba(2,132,199,0.22)]",
    icon: "text-sky-700",
    action:
      "border border-sky-400/55 bg-gradient-to-r from-sky-600 to-sky-700 text-white shadow-[0_14px_34px_rgba(2,132,199,0.3)] hover:from-sky-600/95 hover:to-sky-700/95",
  },
};

export function ConfirmActionDialog({
  trigger,
  open,
  onOpenChange,
  title,
  subtitle,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  icon,
  variant = "destructive",
  onConfirm,
  disabled,
}: ConfirmActionDialogProps) {
  const style = stylesByVariant[variant];
  const Icon = icon ?? (variant === "info" ? ShieldAlert : AlertTriangle);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild disabled={disabled}>
          {trigger}
        </AlertDialogTrigger>
      ) : null}
      <AlertDialogContent
        className="rounded-[24px] border border-white/20 bg-white/95 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.24)]"
      >
        <AlertDialogHeader className="gap-3">
          <AlertDialogMedia className={cn("size-14 rounded-2xl", style.media)}>
            <Icon className={cn("size-7", style.icon)} />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-xl font-semibold text-gray-700">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-gray-600">
            {subtitle}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel className="rounded-full border-violet-200/70 bg-white text-violet-700 hover:bg-violet-50 hover:text-violet-800 focus-visible:!ring-0 focus-visible:!ring-offset-0">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction className={cn("rounded-full", style.action)} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
