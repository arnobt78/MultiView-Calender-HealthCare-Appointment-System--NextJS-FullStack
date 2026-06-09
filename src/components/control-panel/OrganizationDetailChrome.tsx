"use client";

import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { EntityDetailChromeHeader } from "@/components/shared/entity-detail/EntityDetailChromeHeader";
import {
  entityDetailChromeIndigoIconClass,
  entityDetailChromeIndigoIconTileClass,
} from "@/lib/page-chrome-classes";
import { entityDetailPageHeaderClass } from "@/lib/patient-detail-ui-classes";

/** CP organization detail page chrome — icon tile matches list tab tone. */
export function OrganizationDetailChrome({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <EntityDetailChromeHeader
      icon={Building2}
      iconTileClassName={entityDetailChromeIndigoIconTileClass}
      iconClassName={entityDetailChromeIndigoIconClass}
      className={entityDetailPageHeaderClass}
      title={title}
      description={description}
      actions={actions}
    />
  );
}
