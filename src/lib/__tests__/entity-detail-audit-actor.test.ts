import { describe, expect, it } from "vitest";
import {
  mapCategoryRecordAuditActors,
  mapEntityDetailAuditActor,
  mapPatientRecordAuditActors,
  mapUserRecordAuditActors,
  resolveEntityDetailAuditActorHref,
} from "@/lib/entity-detail-audit-actor";

describe("mapEntityDetailAuditActor", () => {
  it("maps audit user include with role and image", () => {
    const actor = mapEntityDetailAuditActor({
      id: "admin-1",
      display_name: "Demo Admin",
      email: "test@admin.com",
      image: "/img.png",
      role: "admin",
    });
    expect(actor).toEqual({
      userId: "admin-1",
      label: "Demo Admin",
      email: "test@admin.com",
      image: "/img.png",
      role: "admin",
    });
  });

  it("falls back to calendar owner when updated_by is null", () => {
    const actor = mapEntityDetailAuditActor(null, {
      id: "owner-1",
      display_name: "Owner Doc",
      email: "owner@clinic.test",
      image: null,
      role: "doctor",
    });
    expect(actor?.userId).toBe("owner-1");
    expect(actor?.role).toBe("doctor");
  });
});

describe("mapUserRecordAuditActors", () => {
  it("maps denormalized user audit fields to inline actors", () => {
    const { createdBy } = mapUserRecordAuditActors({
      id: "doc-1",
      email: "doc@test.com",
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-04T00:00:00.000Z",
      created_by_id: "admin-1",
      created_by_display: "Demo Admin",
      created_by_email: "test@admin.com",
      created_by_image: null,
      created_by_role: "admin",
      updated_by_id: "admin-1",
      updated_by_display: "Demo Admin",
      updated_by_email: "test@admin.com",
      updated_by_role: "admin",
    });
    expect(createdBy?.role).toBe("admin");
  });
});

describe("mapCategoryRecordAuditActors", () => {
  it("maps denormalized category audit fields to inline actors", () => {
    const { createdBy, updatedBy } = mapCategoryRecordAuditActors({
      id: "cat-1",
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-04T00:00:00.000Z",
      label: "Cardiology",
      description: null,
      color: "#f00",
      icon: "heart",
      created_by_id: "admin-1",
      created_by_display: "Demo Admin",
      created_by_email: "test@admin.com",
      created_by_image: null,
      created_by_role: "admin",
      updated_by_id: "admin-1",
      updated_by_display: "Demo Admin",
      updated_by_email: "test@admin.com",
      updated_by_image: null,
      updated_by_role: "admin",
    });
    expect(createdBy?.role).toBe("admin");
    expect(updatedBy?.label).toBe("Demo Admin");
  });
});

describe("mapPatientRecordAuditActors", () => {
  it("maps denormalized patient audit fields to inline actors", () => {
    const { createdBy, updatedBy } = mapPatientRecordAuditActors({
      id: "pat-1",
      firstname: "Demo",
      lastname: "Patient",
      birth_date: null,
      care_level: null,
      pronoun: null,
      email: "test@patient.com",
      active: true,
      active_since: null,
      created_at: "2026-06-01T00:00:00.000Z",
      created_by_id: "admin-1",
      created_by_display: "Demo Admin",
      created_by_email: "test@admin.com",
      created_by_image: null,
      created_by_role: "admin",
      updated_by_id: "admin-1",
      updated_by_display: "Demo Admin",
      updated_by_email: "test@admin.com",
      updated_by_image: null,
      updated_by_role: "admin",
    });
    expect(createdBy?.role).toBe("admin");
    expect(updatedBy?.label).toBe("Demo Admin");
  });
});

describe("resolveEntityDetailAuditActorHref", () => {
  it("links admin actors to CP users for admin viewers", () => {
    const href = resolveEntityDetailAuditActorHref("admin", {
      userId: "00000000-0000-4000-8000-000000000001",
      role: "admin",
    });
    expect(href).toBe(
      "/control-panel/users/00000000-0000-4000-8000-000000000001"
    );
  });
});
