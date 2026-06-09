"use client";

import { PortalPageChrome } from "@/components/shared/PortalPageChrome";
import { INSIGHTS_PAGE_BODY } from "@/lib/insights-page-copy";
import { insightsScopeBodyClass, insightsScopeHintClass } from "@/lib/insights-ui-classes";

type Props = {
  scopeHint?: string;
  actions?: React.ReactNode;
};

export function InsightsPageChrome({ scopeHint, actions }: Props) {
  return (
    <PortalPageChrome
      route="insights"
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
