// Legacy /analytics — permanent redirect to /insights (scope + period live on insights route).

import { redirect } from "next/navigation";

export default function AnalyticsRoute() {
  redirect("/insights");
}
