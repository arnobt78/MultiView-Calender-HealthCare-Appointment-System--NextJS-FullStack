"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { FormRequiredMark } from "@/components/shared/form/FormRequiredMark";

type Props = {
  htmlFor?: string;
  icon: LucideIcon;
  children: ReactNode;
  required?: boolean;
};

/** Violet icon + label row — mirrors patient dialog field labels. */
export function CategoryDialogFieldLabel({ htmlFor, icon: Icon, children, required }: Props) {
  return (
    <div className="flex items-center gap-1.5 text-gray-700">
      <Icon className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-hidden />
      <Label htmlFor={htmlFor} className="text-gray-700">
        {children}
        {required ? <FormRequiredMark /> : null}
      </Label>
    </div>
  );
}
