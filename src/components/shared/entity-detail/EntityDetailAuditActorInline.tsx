"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import {
  resolveEntityDetailAuditActorHref,
  type EntityDetailAuditActor,
} from "@/lib/entity-detail-audit-actor";
import type { EntityRole } from "@/lib/entity-routes";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type EntityDetailAuditActorInlineProps = {
  actor: EntityDetailAuditActor;
  viewerRole?: EntityRole | null;
  className?: string;
};

/** Responsive audit actor — avatar + linked name + email + role badge on one wrapped row. */
export function EntityDetailAuditActorInline({
  actor,
  viewerRole,
  className,
}: EntityDetailAuditActorInlineProps) {
  const emailTrimmed = actor.email?.trim() ?? "";
  const href = resolveEntityDetailAuditActorHref(viewerRole, actor);

  const nameNode = href ? (
    <EntityTitleLink href={href} label={actor.label} className="shrink-0 font-normal text-sm" />
  ) : (
    <span className="shrink-0 text-sm font-normal text-foreground">{actor.label}</span>
  );

  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full flex-wrap items-center gap-x-1.5 gap-y-0.5 align-middle",
        className
      )}
    >
      <UserAvatar
        src={actor.image}
        alt=""
        fallbackText={actor.label}
        sizeClassName="h-5 w-5 shrink-0"
      />
      {nameNode}
      {emailTrimmed ? (
        <span className={cn("shrink-0 text-sm", clinicalCellMutedTextClass)} title={emailTrimmed}>
          ({emailTrimmed})
        </span>
      ) : null}
      {actor.role ? <UserRoleBadge role={actor.role} className="shrink-0" /> : null}
    </span>
  );
}
