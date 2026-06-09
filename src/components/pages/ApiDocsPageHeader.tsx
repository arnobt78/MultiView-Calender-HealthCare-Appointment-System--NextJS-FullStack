"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PortalPageChrome } from "@/components/shared/PortalPageChrome";

/** Client chrome row for SSR `ApiDocsPage` body. */
export function ApiDocsPageHeader() {
  return (
    <PortalPageChrome
      route="api_docs"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      }
    />
  );
}
