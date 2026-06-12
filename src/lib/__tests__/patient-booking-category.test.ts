import { describe, it, expect } from "vitest";
import {
  resolvePatientBookingCategoryId,
  SPECIALTY_CATEGORY_LABEL_TOKENS,
  specialtyCategoryTokenKeys,
} from "@/lib/patient-booking-category";
import { SPECIALTIES } from "@/lib/doctor-specialty";

describe("resolvePatientBookingCategoryId", () => {
  it("maps every configured specialty to category label tokens", () => {
    for (const specialty of SPECIALTIES) {
      expect(SPECIALTY_CATEGORY_LABEL_TOKENS[specialty]?.length).toBeGreaterThan(0);
    }
    expect(specialtyCategoryTokenKeys()).toEqual(SPECIALTIES);
  });

  it("falls back to lowest sort_order active category when specialty is unknown", async () => {
    const prisma = {
      appointmentType: { findFirst: async () => null },
      user: { findUnique: async () => ({ specialty: null }) },
      category: {
        findFirst: async (args: { orderBy?: { sort_order: string } }) => {
          if (args.orderBy?.sort_order === "asc") return { id: "cat-primary" };
          return null;
        },
      },
    } as unknown as Parameters<typeof resolvePatientBookingCategoryId>[0];

    const id = await resolvePatientBookingCategoryId(prisma, "doc-1", null);
    expect(id).toBe("cat-primary");
  });

  it("prefers exact visit-type name match on active category label", async () => {
    const prisma = {
      appointmentType: {
        findFirst: async () => ({ name: "Cardiology" }),
      },
      category: {
        findFirst: async (args: { where: { label?: { equals?: string } } }) => {
          if (args.where.label?.equals === "Cardiology") return { id: "cat-cardio" };
          return null;
        },
      },
      user: { findUnique: async () => null },
    } as unknown as Parameters<typeof resolvePatientBookingCategoryId>[0];

    const id = await resolvePatientBookingCategoryId(prisma, "doc-1", "type-1");
    expect(id).toBe("cat-cardio");
  });

  it("maps Medicine doctor to Primary Care category via specialty tokens", async () => {
    let categoryQueryCount = 0;
    const prisma = {
      appointmentType: { findFirst: async () => ({ name: "Initial Consultation" }) },
      user: { findUnique: async () => ({ specialty: "Medicine" }) },
      category: {
        findFirst: async (args: {
          where?: { OR?: Array<{ label?: { contains?: string } }> };
        }) => {
          categoryQueryCount += 1;
          const tokens = args.where?.OR?.map((o) => o.label?.contains) ?? [];
          if (tokens.includes("Primary Care")) return { id: "cat-primary-care" };
          return null;
        },
      },
    } as unknown as Parameters<typeof resolvePatientBookingCategoryId>[0];

    const id = await resolvePatientBookingCategoryId(prisma, "doc-1", "type-1");
    expect(id).toBe("cat-primary-care");
    expect(categoryQueryCount).toBeGreaterThan(0);
  });
});
