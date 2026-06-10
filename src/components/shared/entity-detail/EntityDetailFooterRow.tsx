"use client";

import type { LinkProps } from "next/link";
import type { ReactNode } from "react";
import { EntityDetailBackLink } from "@/components/shared/entity-detail/EntityDetailBackLink";
import { entityDetailActionsRowClass } from "@/lib/patient-detail-ui-classes";

type EntityDetailFooterRowProps = {
  backHref: LinkProps["href"];
  backButtonClassName: string;
  backLabel?: string;
  /** Glass CRUD cluster — Update / Delete / Save etc. */
  actions?: ReactNode;
};

/** Inline footer row after detail card — left back link, right optional actions. */
export function EntityDetailFooterRow({
  backHref,
  backButtonClassName,
  backLabel = "Back To List",
  actions,
}: EntityDetailFooterRowProps) {
  return (
    <div className={entityDetailActionsRowClass}>
      <EntityDetailBackLink
        href={backHref}
        placement="footer"
        backButtonClassName={backButtonClassName}
        footerLabel={backLabel}
      />
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
