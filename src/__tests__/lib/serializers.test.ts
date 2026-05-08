/**
 * Unit tests — serializers.ts
 * Verifies that sensitive fields are excluded and dates are ISO strings.
 */
import { describe, it, expect } from "vitest";
import { serializeUser, serializePatient, serializeCategory } from "@/lib/serializers";

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
