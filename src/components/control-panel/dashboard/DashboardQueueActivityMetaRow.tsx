"use client";

import { FilePlus, PencilLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { formatDashboardAppointmentActivityAt } from "@/components/control-panel/dashboard/dashboard-appointment-datetime";
import type { DashboardAppointmentActivityKind } from "@/lib/dashboard-overview-recent-activity";
import type { DashboardOverviewQueueActor } from "@/lib/dashboard-overview-queue";
import { userDetailHref } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

const ACTIVITY_META: Record<
  DashboardAppointmentActivityKind,
  { label: string; icon: LucideIcon; iconClass: string; labelClass: string }
> = {
  created: {
    label: "Created",
    icon: FilePlus,
    iconClass: "text-emerald-600/85",
    labelClass: "text-emerald-700 font-medium",
  },
  updated: {
    label: "Updated",
    icon: PencilLine,
    iconClass: "text-violet-600/85",
    labelClass: "text-violet-700 font-medium",
  },
};

type Props = {
  kind: DashboardAppointmentActivityKind;
  activityAt: string;
  actor: DashboardOverviewQueueActor;
  className?: string;
};

/** Created/Updated line — icon, action label, timestamp, linked actor (admin CP user detail). */
export function DashboardQueueActivityMetaRow({ kind, activityAt, actor, className }: Props) {
  const meta = ACTIVITY_META[kind];
  const Icon = meta.icon;
  const actorLabel = actor.display_name?.trim() || actor.email?.trim() || "User";
  const actorHref = userDetailHref("admin", actor.id);

  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs",
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", meta.iconClass)} aria-hidden />
      <span className={meta.labelClass}>{meta.label}</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-muted-foreground tabular-nums">
        {formatDashboardAppointmentActivityAt(activityAt)}
      </span>
      <span className="text-muted-foreground">·</span>
      <UserAvatar
        src={actor.image}
        alt={actorLabel}
        fallbackText={actorLabel}
        sizeClassName="h-5 w-5 shrink-0"
      />
      <EntityTitleLink href={actorHref} label={actorLabel} className="text-xs font-medium" />
    </span>
  );
}
