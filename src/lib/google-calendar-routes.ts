/** OAuth return URLs — shared by callback route + client param handlers. */
export const GOOGLE_CALENDAR_CP_PATH = "/control-panel/google-calendar" as const;

export const GOOGLE_CALENDAR_CONNECTED_QUERY_KEY = "gcal" as const;
export const GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE = "connected" as const;

export const GOOGLE_CALENDAR_OAUTH_CONNECTED_PARAM =
  `${GOOGLE_CALENDAR_CONNECTED_QUERY_KEY}=${GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE}` as const;

export function googleCalendarConnectedReturnUrl(origin: string): URL {
  return new URL(`${GOOGLE_CALENDAR_CP_PATH}?${GOOGLE_CALENDAR_OAUTH_CONNECTED_PARAM}`, origin);
}

export function googleCalendarFailedReturnUrl(origin: string): URL {
  return new URL(`${GOOGLE_CALENDAR_CP_PATH}?error=gcal_failed`, origin);
}

export function isGoogleCalendarOAuthConnectedParam(
  params: Pick<URLSearchParams, "get">
): boolean {
  return params.get(GOOGLE_CALENDAR_CONNECTED_QUERY_KEY) === GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE;
}
