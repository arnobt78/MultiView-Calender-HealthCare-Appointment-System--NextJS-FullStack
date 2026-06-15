export const dynamic = "force-dynamic";

import { ControlPanelSectionServerPage } from "@/components/control-panel/ControlPanelSectionServerPage";
import {
  GOOGLE_CALENDAR_CONNECTED_QUERY_KEY,
  GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE,
} from "@/lib/google-calendar-routes";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = params[GOOGLE_CALENDAR_CONNECTED_QUERY_KEY];
  const gcalOAuthReturn =
    (Array.isArray(raw) ? raw[0] : raw) === GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE;

  return ControlPanelSectionServerPage({
    tab: "google-calendar",
    gcalOAuthReturn,
  });
}
