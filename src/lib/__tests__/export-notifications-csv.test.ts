import { describe, expect, it } from "vitest";
import { buildNotificationsCsvContent } from "@/lib/export-notifications-csv";
import type { Notification } from "@/types/notification";

function baseNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n1",
    user_id: "u1",
    title: "Test title",
    message: "Test message",
    type: "appointment_created",
    read: false,
    created_at: "2026-06-14T10:00:00.000Z",
    link: "/appointments/a1",
    link_valid: true,
    ...overrides,
  };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

describe("buildNotificationsCsvContent", () => {
  it("includes Link and Link Valid headers in order", () => {
    const csv = buildNotificationsCsvContent([]);
    const headers = csv.split("\n")[0]?.split(",") ?? [];
    expect(headers).toEqual([
      "ID",
      "Type",
      "Type Label",
      "Title",
      "Message",
      "Read",
      "Received",
      "Link",
      "Link Valid",
    ]);
  });

  it("maps link_valid true to yes and false to no", () => {
    const csv = buildNotificationsCsvContent([
      baseNotification({ id: "valid", link_valid: true }),
      baseNotification({
        id: "stale",
        link: "/appointments/a1 (deleted)",
        link_valid: false,
      }),
    ]);
    const lines = csv.split("\n");
    const validRow = parseCsvLine(lines[1] ?? "");
    const staleRow = parseCsvLine(lines[2] ?? "");
    expect(validRow[7]).toBe("/appointments/a1");
    expect(validRow[8]).toBe("yes");
    expect(staleRow[7]).toBe("/appointments/a1 (deleted)");
    expect(staleRow[8]).toBe("no");
  });

  it("maps missing link_valid to no", () => {
    const csv = buildNotificationsCsvContent([
      baseNotification({ link_valid: undefined, link: undefined }),
    ]);
    const row = parseCsvLine(csv.split("\n")[1] ?? "");
    expect(row[7]).toBe("");
    expect(row[8]).toBe("no");
  });

  it("escapes commas and quotes in title, message, and link", () => {
    const csv = buildNotificationsCsvContent([
      baseNotification({
        title: 'Title, "quoted"',
        message: "Line\nbreak",
        link: "https://example.com?a=1,b=2",
      }),
    ]);
    expect(csv).toContain('"Title, ""quoted"""');
    expect(csv).toContain('"Line\nbreak"');
    expect(csv).toContain('"https://example.com?a=1,b=2"');
  });
});
