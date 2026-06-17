"use client";

import { Calendar, Hash, Receipt, Stethoscope, Tags, User, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppointmentDetailToneClasses } from "@/lib/appointment-detail-ui-classes";
import { entityDetailSnapshotSectionShellClass } from "@/lib/patient-detail-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  toneClasses: AppointmentDetailToneClasses;
  tone: "sky" | "violet";
};

function FieldLabelSkeleton({
  toneClasses,
  icon: Icon,
  label,
}: {
  toneClasses: AppointmentDetailToneClasses;
  icon: typeof Hash;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className={toneClasses.fieldIconCircleClass}>
        <Icon className={toneClasses.fieldIconClass} aria-hidden />
      </span>
      {label}
    </div>
  );
}

/** Inner Visit Overview pulse — chrome + card shell stay mounted (patient detail parity). */
export function AppointmentDetailBodySkeleton({ toneClasses, tone }: Props) {
  return (
    <div className="space-y-3 text-gray-700">
      <div className={toneClasses.schemaSectionClass}>
        <div className="flex flex-wrap items-start gap-3">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-full max-w-md rounded-full" aria-hidden />
            <Skeleton className="h-4 w-56 rounded" aria-hidden />
            <Skeleton className="h-4 w-44 rounded" aria-hidden />
          </div>
        </div>
        <dl className={cn(toneClasses.definitionListClass, "mt-3")}>
          <div className={toneClasses.definitionRowClass}>
            <FieldLabelSkeleton toneClasses={toneClasses} icon={Hash} label="Appointment ID" />
            <Skeleton className="h-4 w-full max-w-[320px] sm:mt-0.5" aria-hidden />
          </div>
          <div className={toneClasses.definitionRowClass}>
            <FieldLabelSkeleton toneClasses={toneClasses} icon={Stethoscope} label="Chief complaint" />
            <Skeleton className="h-4 w-full max-w-[280px] sm:mt-0.5" aria-hidden />
          </div>
          <div className={toneClasses.definitionRowClass}>
            <FieldLabelSkeleton toneClasses={toneClasses} icon={Tags} label="Category" />
            <Skeleton className="h-4 w-40 sm:mt-0.5" aria-hidden />
          </div>
        </dl>
      </div>

      <div
        className={cn(
          entityDetailSnapshotSectionShellClass,
          tone === "violet" && "border-violet-100/80"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={toneClasses.sectionIconCircleClass}>
            <Users className={toneClasses.sectionIconClass} aria-hidden />
          </span>
          <Skeleton className="h-5 w-48 rounded" aria-hidden />
        </div>
        <dl className={cn(toneClasses.definitionListClass, "mt-2")}>
          {["Patient", "Calendar owner", "Treating physician"].map((label) => (
            <div key={label} className={toneClasses.definitionRowClass}>
              <FieldLabelSkeleton
                toneClasses={toneClasses}
                icon={label === "Patient" ? User : Calendar}
                label={label}
              />
              <Skeleton className="h-8 w-full max-w-sm sm:mt-0.5" aria-hidden />
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2">
        <Skeleton className="h-5 w-32 rounded" aria-hidden />
        <div className="mt-2 space-y-1">
          <Skeleton className="h-5 w-full max-w-[560px] rounded-md" aria-hidden />
          <Skeleton className="h-5 w-full max-w-[520px] rounded-md" aria-hidden />
        </div>
      </div>

      <div
        className={cn(
          entityDetailSnapshotSectionShellClass,
          tone === "violet" && "border-violet-100/80"
        )}
      >
        <div className="flex items-center gap-2">
          <span className={toneClasses.sectionIconCircleClass}>
            <Receipt className={toneClasses.sectionIconClass} aria-hidden />
          </span>
          <Skeleton className="h-5 w-40 rounded" aria-hidden />
        </div>
        <Skeleton className="mt-2 h-24 w-full rounded-md" aria-hidden />
      </div>
    </div>
  );
}
