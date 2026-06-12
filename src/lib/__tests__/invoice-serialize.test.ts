import { describe, expect, it } from "vitest";
import { serializeInvoice } from "@/lib/serializers";

describe("serializeInvoice audit fields", () => {
  it("denormalizes created_by and updated_by for Record Audit", () => {
    const row = serializeInvoice({
      id: "inv-1",
      created_at: new Date("2026-06-01T10:00:00.000Z"),
      updated_at: new Date("2026-06-02T12:00:00.000Z"),
      created_by_id: "admin-1",
      updated_by_id: "admin-2",
      appointment_id: null,
      user_id: "doc-1",
      amount: 5000,
      currency: "eur",
      status: "draft",
      due_date: null,
      paid_at: null,
      description: "Test",
      created_by: {
        id: "admin-1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: "/a.png",
        role: "admin",
      },
      updated_by: {
        id: "admin-2",
        display_name: "Editor",
        email: "editor@admin.com",
        image: null,
        role: "admin",
      },
      payments: [],
    });

    expect(row.updated_at).toBe("2026-06-02T12:00:00.000Z");
    expect(row.created_by_display).toBe("Demo Admin");
    expect(row.updated_by_display).toBe("Editor");
    expect(row.created_by_role).toBe("admin");
  });
});
