"use client";

/**
 * Activities — in-memory list merged on save with POST to `/api/appointments/:id/activities`.
 * - Edit: show existing rows newest-first in a scroll region (matches list views); inline add appends to the same list.
 * - Create: same add UI is optional pre-save notes; staff can also add activities after the row exists.
 *
 * Layout: type + content share one row on `sm+`; primary **Add** sits full-width below with sky glass styling
 * (matches appointment dialog shell) without changing add/remove handlers.
 */

import { useMemo } from "react";
import { ListPlus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Activity } from "@/types/types";

const glassInputClass =
  "w-full min-w-0 rounded-2xl border border-sky-200/50 bg-white/75 text-gray-700 shadow-[0_8px_24px_rgba(2,132,199,0.14)] backdrop-blur-md transition-colors placeholder:text-gray-500 focus-visible:border-sky-400/50 focus-visible:ring-2 focus-visible:ring-sky-200/40";

const glassAddButtonClass =
  "w-full rounded-2xl border border-sky-400/40 bg-linear-to-r from-sky-500/90 to-sky-600/95 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(2,132,199,0.35)] backdrop-blur-md transition-all hover:from-sky-500 hover:to-sky-700 hover:shadow-[0_16px_40px_rgba(2,132,199,0.45)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4";

type Props = {
  isEditMode: boolean;
  activityType: string;
  setActivityType: (v: string) => void;
  activityContent: string;
  setActivityContent: (v: string) => void;
  activityList: Activity[];
  loading: boolean;
  onAddActivity: () => void;
  onRemoveActivity: (id: string) => void;
};

export function AppointmentDialogActivitiesSection({
  isEditMode,
  activityType,
  setActivityType,
  activityContent,
  setActivityContent,
  activityList,
  loading,
  onAddActivity,
  onRemoveActivity,
}: Props) {
  const sortedForDisplay = useMemo(() => {
    return [...activityList].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [activityList]);

  return (
    <div className="space-y-3 text-gray-700">
      {isEditMode ? (
        <p className="text-xs leading-relaxed text-gray-600">
          Newest first (same ordering as timeline views). Scroll if the list is long.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-gray-600">
          Optional — add a first note or call log before save, or add activities after the appointment is created.
        </p>
      )}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-gray-700">
          <ListPlus className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
          <Label className="text-gray-700">Add activity</Label>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          <Input
            placeholder="Type (Phone, Visit, etc.)"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className={cn(glassInputClass, "cursor-text")}
          />
          <Input
            placeholder="Content"
            value={activityContent}
            onChange={(e) => setActivityContent(e.target.value)}
            className={cn(glassInputClass, "cursor-text")}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onAddActivity}
          disabled={loading}
          className={cn(glassAddButtonClass, "inline-flex cursor-pointer items-center justify-center gap-2")}
        >
          <Plus className="shrink-0" aria-hidden />
          Add activity
        </Button>
        <div
          className={
            activityList.length > 4
              ? "mt-1 flex max-h-52 flex-col gap-1 overflow-y-auto pr-1"
              : "mt-1 flex flex-col gap-1"
          }
        >
          {sortedForDisplay.map((a) => (
            <span
              key={a.id}
              className="flex items-center gap-1 rounded-2xl border border-sky-200/40 bg-white/70 px-2 py-1 text-xs text-gray-700 shadow-[0_4px_16px_rgba(2,132,199,0.1)] backdrop-blur-sm"
            >
              {a.type}: {a.content}
              <button
                type="button"
                onClick={() => onRemoveActivity(a.id)}
                className="ml-1 cursor-pointer rounded text-red-500 hover:bg-red-100"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
