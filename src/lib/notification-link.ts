/**
 * Notification deep-link parsing, href builders, and stale-link cleanup on entity delete.
 * Notifications store plain URL strings — no FK — so deletes must null links explicitly.
 */

import { prisma } from "@/lib/prisma";
import {
  appointmentDetailHref,
  invoiceDetailHref,
  patientDetailHref,
} from "@/lib/entity-routes";

/** Appended once when the linked entity is deleted (idempotent). */
export const NOTIFICATION_STALE_SUFFIX = " (no longer available)";

export type NotificationLinkTargetKind =
  | "appointment"
  | "invoice"
  | "patient"
  | "static"
  | "unknown";

export type NotificationLinkTarget = {
  kind: NotificationLinkTargetKind;
  id?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Known section routes — always considered navigable when used as notification links. */
const STATIC_NOTIFICATION_PATHS = new Set([
  "/dashboard",
  "/doctor-portal",
  "/patient-portal",
  "/control-panel/notifications",
  "/control-panel/appointment-management",
  "/control-panel/invoice-management",
  "/control-panel/patient-management",
]);

function normalizeLinkPath(link: string): string {
  const trimmed = link.trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      return url.pathname;
    }
  } catch {
    /* treat as path */
  }
  return trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
}

/** Parse a stored notification link into entity kind + optional UUID. */
export function parseNotificationLinkTarget(
  link: string | null | undefined
): NotificationLinkTarget {
  const path = normalizeLinkPath(link ?? "");
  if (!path) return { kind: "unknown" };

  if (STATIC_NOTIFICATION_PATHS.has(path)) {
    return { kind: "static" };
  }

  const appointmentMatch = path.match(
    /^\/(?:control-panel\/)?appointments\/([^/]+)$/
  );
  if (appointmentMatch?.[1] && UUID_RE.test(appointmentMatch[1])) {
    return { kind: "appointment", id: appointmentMatch[1] };
  }

  const invoiceMatch = path.match(/^\/(?:control-panel\/)?invoices\/([^/]+)$/);
  if (invoiceMatch?.[1] && UUID_RE.test(invoiceMatch[1])) {
    return { kind: "invoice", id: invoiceMatch[1] };
  }

  const patientMatch = path.match(/^\/(?:control-panel\/)?patients\/([^/]+)$/);
  if (patientMatch?.[1] && UUID_RE.test(patientMatch[1])) {
    return { kind: "patient", id: patientMatch[1] };
  }

  if (path.startsWith("/control-panel/") || path.startsWith("/")) {
    return { kind: "static" };
  }

  return { kind: "unknown" };
}

/** All href variants that may appear on notification rows for one entity. */
export function notificationHrefsForEntity(
  kind: "appointment" | "invoice" | "patient",
  id: string
): string[] {
  switch (kind) {
    case "appointment":
      return [
        appointmentDetailHref("admin", id),
        appointmentDetailHref("doctor", id),
        appointmentDetailHref("patient", id),
      ];
    case "invoice":
      return [
        invoiceDetailHref("admin", id),
        invoiceDetailHref("doctor", id),
        invoiceDetailHref("patient", id),
      ];
    case "patient":
      return [
        patientDetailHref("admin", id),
        patientDetailHref("doctor", id),
        patientDetailHref("patient", id),
      ];
  }
}

/** Idempotent message suffix when entity is deleted. */
export function appendNotificationStaleSuffix(message: string): string {
  const trimmed = message.trimEnd();
  if (trimmed.endsWith(NOTIFICATION_STALE_SUFFIX)) return trimmed;
  return `${trimmed}${NOTIFICATION_STALE_SUFFIX}`;
}

/**
 * After appointment/invoice delete — null matching links and suffix messages.
 * Keeps rows for audit; prevents 404 deep-links in bell + CP table.
 */
export async function clearStaleNotificationLinksForEntity(
  kind: "appointment" | "invoice" | "patient",
  entityId: string
): Promise<number> {
  const hrefs = notificationHrefsForEntity(kind, entityId);
  const rows = await prisma.notification.findMany({
    where: { link: { in: hrefs } },
    select: { id: true, message: true },
  });
  if (!rows.length) return 0;

  await Promise.all(
    rows.map((row) =>
      prisma.notification.update({
        where: { id: row.id },
        data: {
          link: null,
          message: appendNotificationStaleSuffix(row.message),
        },
      })
    )
  );

  return rows.length;
}
