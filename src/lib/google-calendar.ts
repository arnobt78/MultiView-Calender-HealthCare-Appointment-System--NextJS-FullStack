/**
 * Google Calendar Integration Helper
 * 
 * Provides functions to:
 * - Create an OAuth2 client
 * - Generate the consent URL
 * - Exchange authorization codes for tokens
 * - Push/pull events between local appointments and Google Calendar
 * - Map between local Appointment format and Google Calendar Event format
 * 
 * Requires env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXT_PUBLIC_APP_URL
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
/*
 * IMPORTANT: This URI must exactly match one of the "Authorized redirect URIs" in
 * Google Cloud Console → Credentials → OAuth 2.0 Client IDs.
 * Add both your local and production URIs:
 *   http://localhost:3000/api/calendar/callback
 *   https://your-production-domain.com/api/calendar/callback
 */
const REDIRECT_URI = `${APP_URL}/api/calendar/callback`;
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

/**
 * Generate Google OAuth consent URL
 */
export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    ...(state ? { state } : {}),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to exchange code: ${err}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expiry_date: number;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expiry_date: Date.now() + (data.expires_in || 3600) * 1000,
  };
}

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
}

/**
 * Get a valid access token (refreshes if expired)
 */
export async function getValidAccessToken(
  accessToken: string,
  refreshToken: string | null,
  expiryDate: Date | null,
  onTokenUpdate?: (newToken: string, newExpiry: Date) => Promise<void>
): Promise<string> {
  if (expiryDate && new Date() < expiryDate) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new Error("Access token expired and no refresh token available");
  }

  const refreshed = await refreshAccessToken(refreshToken);
  
  if (onTokenUpdate) {
    await onTokenUpdate(refreshed.access_token, new Date(refreshed.expiry_date));
  }

  return refreshed.access_token;
}

/**
 * Insert an event into Google Calendar
 */
export async function insertGoogleEvent(
  accessToken: string,
  calendarId: string,
  event: GoogleCalendarEvent
): Promise<GoogleCalendarEvent> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to insert Google Calendar event: ${err}`);
  }

  return response.json();
}

/**
 * List events from Google Calendar
 */
export async function listGoogleEvents(
  accessToken: string,
  calendarId: string,
  timeMin?: string,
  timeMax?: string,
  maxResults = 100
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    maxResults: String(maxResults),
    singleEvents: "true",
    orderBy: "startTime",
    ...(timeMin ? { timeMin } : {}),
    ...(timeMax ? { timeMax } : {}),
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list Google Calendar events: ${err}`);
  }

  const data = await response.json();
  return data.items || [];
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete Google Calendar event");
  }
}

/**
 * Map a local appointment to a Google Calendar event
 */
export function appointmentToGoogleEvent(appointment: {
  title: string;
  notes?: string | null;
  start: string;
  end: string;
  location?: string | null;
}): GoogleCalendarEvent {
  return {
    summary: appointment.title,
    description: appointment.notes || "",
    location: appointment.location || "",
    start: { dateTime: new Date(appointment.start).toISOString() },
    end: { dateTime: new Date(appointment.end).toISOString() },
  };
}
