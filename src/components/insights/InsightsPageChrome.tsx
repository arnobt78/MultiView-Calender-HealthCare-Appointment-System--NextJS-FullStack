"use client";

/**
 * /insights top chrome — same icon, title, and subtitle on success, loading, and error.
 */

import { TrendingUp } from "lucide-react";
import { PortalChromeHeader } from "@/components/shared/PortalChromeHeader";
import {
  INSIGHTS_PAGE_BODY,
  INSIGHTS_PAGE_TITLE,
} from "@/lib/insights-page-copy";
import { insightsScopeBodyClass, insightsScopeHintClass } from "@/lib/insights-ui-classes";

type Props = {
  scopeHint?: string;
  actions?: React.ReactNode;
};

export function InsightsPageChrome({ scopeHint, actions }: Props) {
  return (
    <PortalChromeHeader
      icon={TrendingUp}
      title={INSIGHTS_PAGE_TITLE}
      description={
        scopeHint ? (
          <>
            <span className={insightsScopeHintClass}>{scopeHint}</span>{" "}
            <span className={insightsScopeBodyClass}>{INSIGHTS_PAGE_BODY}</span>
          </>
        ) : (
          <span className={insightsScopeBodyClass}>{INSIGHTS_PAGE_BODY}</span>
        )
      }
      actions={actions}
    />
  );
}
