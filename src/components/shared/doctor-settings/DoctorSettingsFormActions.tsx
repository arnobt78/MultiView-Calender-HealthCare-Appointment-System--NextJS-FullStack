"use client";

import type { LucideIcon } from "lucide-react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { doctorSettingsActionButtonClass } from "@/components/shared/doctor-settings/doctor-settings-classes";
import { toTitleCaseLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tone = "weekly" | "timeOff";

type Props = {
  tone: Tone;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  pending?: boolean;
  saveIcon?: LucideIcon;
  disabled?: boolean;
};

/** Save + Cancel aligned right — same height/font as glass summary chips. */
export function DoctorSettingsFormActions({
  tone,
  onSave,
  onCancel,
  saveLabel,
  pending = false,
  saveIcon: SaveIcon = Plus,
  disabled = false,
}: Props) {
  const glow = doctorSettingsActionButtonClass[tone];
  const outline =
    tone === "weekly"
      ? "h-9 gap-1 rounded-full border-sky-200/80 bg-white/90 px-3 text-sm font-semibold text-sky-900 shadow-sm hover:bg-sky-50 has-[>svg]:px-3"
      : "h-9 gap-1 rounded-full border-amber-200/80 bg-white/90 px-3 text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-50 has-[>svg]:px-3";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={outline}
        disabled={pending || disabled}
        onClick={onCancel}
      >
        <X className="h-3.5 w-3.5" />
        {toTitleCaseLabel("Cancel")}
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={pending || disabled}
        onClick={onSave}
        className={cn(glow, "gap-1 has-[>svg]:px-3")}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <SaveIcon className="h-3.5 w-3.5" />
        )}
        {toTitleCaseLabel(saveLabel)}
      </Button>
    </div>
  );
}
