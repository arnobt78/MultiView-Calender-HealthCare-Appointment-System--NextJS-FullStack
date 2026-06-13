"use client";

import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import {
  resolveEntityDetailAuditActorHref,
  type EntityDetailAuditActor,
} from "@/lib/entity-detail-audit-actor";
import {
  clinicalIdentityCompactStackBadgeRowClass,
  clinicalIdentityCompactStackNameEmailRowClass,
  clinicalIdentityCompactStackRowClass,
  clinicalIdentityCompactStackStaffAvatarClass,
  clinicalIdentityCompactStackTextColClass,
  clinicalIdentityInlineNameClass,
} from "@/lib/clinical-identity-inline-ui";
import type { EntityRole } from "@/lib/entity-routes";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type Props = {
  actor: EntityDetailAuditActor;
  viewerRole?: EntityRole | null;
  className?: string;
  /** CP invoice table — `compactStack` parity with description column identities. */
  compact?: boolean;
};

/** Responsive audit actor — avatar + linked name + email + role badge. */
export function EntityDetailAuditActorInline({
  actor,
  viewerRole,
  className,
  compact = false,
}: Props) {
  const emailTrimmed = actor.email?.trim() ?? "";
  const href = resolveEntityDetailAuditActorHref(viewerRole, actor);

  const compactNameNode = href ? (
    <EntityTitleLink
      href={href}
      label={actor.label}
      className="min-w-0 shrink truncate text-sm font-normal"
    />
  ) : (
    <span className="min-w-0 shrink truncate text-sm font-normal text-foreground">
      {actor.label}
    </span>
  );

  if (compact) {
    return (
      <div className={cn(clinicalIdentityCompactStackRowClass, className)}>
        <UserAvatar
          src={actor.image}
          alt=""
          fallbackText={actor.label}
          sizeClassName={clinicalIdentityCompactStackStaffAvatarClass}
        />
        <div className={clinicalIdentityCompactStackTextColClass}>
          <div className={clinicalIdentityCompactStackNameEmailRowClass}>
            {compactNameNode}
            {emailTrimmed ? (
              <span
                className={cn("shrink-0 text-xs", clinicalCellMutedTextClass)}
                title={emailTrimmed}
              >
                ({emailTrimmed})
              </span>
            ) : null}
          </div>
          {actor.role ? (
            <div className={clinicalIdentityCompactStackBadgeRowClass}>
              <UserRoleBadge role={actor.role} className="shrink-0" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const nameNode = href ? (
    <EntityTitleLink
      href={href}
      label={actor.label}
      className={clinicalIdentityInlineNameClass}
    />
  ) : (
    <span className={cn(clinicalIdentityInlineNameClass, "text-foreground")}>
      {actor.label}
    </span>
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
