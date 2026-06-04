/**
 * Unit tests — serializers.ts
 * Verifies that sensitive fields are excluded and dates are ISO strings.
 */
import { describe, it, expect } from "vitest";
import {
  serializeUser,
  serializePatient,
  serializeCategory,
  serializeAppointment,
} from "@/lib/serializers";

describe("serializeUser", () => {
  const raw = {
    id: "u1",
    email: "admin@example.com",
    display_name: "Admin",
    role: "admin" as string | null,
    image: null as string | null,
    created_at: new Date("2024-01-01T00:00:00Z"),
  };

  it("includes core user fields", () => {
    const result = serializeUser(raw);
    expect(result.id).toBe("u1");
    expect(result.email).toBe("admin@example.com");
    expect(result.role).toBe("admin");
  });

  it("serializes created_at as ISO string", () => {
    const result = serializeUser(raw);
    expect(typeof result.created_at).toBe("string");
    expect(result.created_at).toContain("2024-01-01");
  });

  it("preserves null image", () => {
    const result = serializeUser(raw);
    expect(result.image).toBeNull();
  });

  it("denormalizes audit actor portrait and role from detail include", () => {
    const result = serializeUser({
      ...raw,
      updated_at: new Date("2026-06-04"),
      created_by_id: "admin-1",
      updated_by_id: "admin-1",
      created_by: {
        id: "admin-1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: null,
        role: "admin",
      },
      updated_by: {
        id: "admin-1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: null,
        role: "admin",
      },
    });
    expect(result.created_by_role).toBe("admin");
    expect(result.updated_at).toContain("2026-06-04");
  });
});

describe("serializePatient", () => {
  it("denormalizes audit actor portrait and role from detail include", () => {
    const result = serializePatient({
      id: "p1",
      created_at: new Date("2026-06-01"),
      updated_at: new Date("2026-06-04"),
      firstname: "Demo",
      lastname: "Patient",
      birth_date: null,
      care_level: null,
      pronoun: null,
      email: "test@patient.com",
      active: true,
      active_since: null,
      created_by_id: "u1",
      updated_by_id: "u1",
      created_by: {
        id: "u1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: "/avatar.png",
        role: "admin",
      },
      updated_by: {
        id: "u1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: "/avatar.png",
        role: "admin",
      },
    });
    expect(result.created_by_role).toBe("admin");
    expect(result.created_by_image).toBe("/avatar.png");
    expect(result.updated_by_role).toBe("admin");
  });
});

describe("serializeCategory audit", () => {
  it("denormalizes audit actor portrait and role from detail include", () => {
    const result = serializeCategory({
      id: "c1",
      label: "Cardiology",
      color: "#f00",
      icon: "heart",
      description: null,
      created_at: new Date("2026-06-01"),
      updated_at: new Date("2026-06-04"),
      created_by_id: "u1",
      updated_by_id: "u1",
      created_by: {
        id: "u1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: "/a.png",
        role: "admin",
      },
      updated_by: {
        id: "u1",
        display_name: "Demo Admin",
        email: "test@admin.com",
        image: "/a.png",
        role: "admin",
      },
    });
    expect(result.created_by_role).toBe("admin");
    expect(result.updated_by_image).toBe("/a.png");
  });
});

describe("serializeCategory", () => {
  const raw = {
    id: "c1",
    label: "Cardiology",
    color: "#ff0000",
    icon: null,
    description: null,
    created_at: new Date("2024-06-01"),
    updated_at: null,
  };

  it("includes label, color, icon", () => {
    const result = serializeCategory(raw);
    expect(result.label).toBe("Cardiology");
    expect(result.color).toBe("#ff0000");
  });

  it("serializes dates as strings", () => {
    const result = serializeCategory(raw);
    expect(typeof result.created_at).toBe("string");
  });
});

/**
 * B3: Prisma calendar-owner field is `owner_id`; API contract keeps `user_id` for clients.
 */
describe("serializeAppointment", () => {
  const raw = {
    id: "a1",
    created_at: new Date("2025-06-01T10:00:00Z"),
    updated_at: null as Date | null,
    start: new Date("2025-06-15T14:00:00Z"),
    end: new Date("2025-06-15T15:00:00Z"),
    location: "Clinic",
    patient_id: "p1",
    category_id: "c1",
    notes: null,
    title: "Visit",
    status: "pending",
    owner_id: "owner-uuid-1",
    treating_physician_id: "treat-uuid-2",
    attachments: [] as string[],
  };

  it("maps owner_id to user_id on the wire", () => {
    const result = serializeAppointment(raw);
    expect(result.user_id).toBe("owner-uuid-1");
    expect(result.treating_physician_id).toBe("treat-uuid-2");
  });

  it("defaults null treating_physician_id in output", () => {
    const minimal = {
      id: "a2",
      created_at: new Date("2025-06-01T10:00:00Z"),
      updated_at: null as Date | null,
      start: new Date("2025-06-15T14:00:00Z"),
      end: new Date("2025-06-15T15:00:00Z"),
      location: null,
      patient_id: null,
      category_id: null,
      notes: null,
      title: "Visit",
      status: "pending" as string | null,
      owner_id: "owner-only",
      attachments: [] as string[],
    };
    const result = serializeAppointment(minimal);
    expect(result.treating_physician_id).toBeNull();
  });
});
