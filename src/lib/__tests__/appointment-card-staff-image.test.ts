import { describe, expect, it } from "vitest";
import { resolvePrimaryDoctorCardImage } from "@/lib/appointment-card-staff-image";
import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";

const owners: OwnerUserSummary[] = [
  {
    id: "doc-1",
    email: "doc@test.com",
    display_name: "Demo Doctor",
    image: "https://cdn.example/owner.png",
  },
];

describe("resolvePrimaryDoctorCardImage", () => {
  it("uses patient denormalized image first", () => {
    expect(
      resolvePrimaryDoctorCardImage(
        {
          patient_data: {
            primary_doctor_image: "https://cdn.example/patient-field.png",
          } as never,
          calendarOwnerId: "doc-1",
        },
        "doc-1",
        owners
      )
    ).toBe("https://cdn.example/patient-field.png");
  });

  it("reuses calendar owner portrait when primary id matches owner", () => {
    expect(
      resolvePrimaryDoctorCardImage(
        { patient_data: { primary_doctor_id: "doc-1" } as never, calendarOwnerId: "doc-1" },
        "doc-1",
        owners
      )
    ).toBe("https://cdn.example/owner.png");
  });

  it("uses portal_owner image for patient dashboard (no users/search)", () => {
    expect(
      resolvePrimaryDoctorCardImage(
        {
          portal_owner: {
            id: "doc-1",
            display_name: "Demo Doctor",
            email: "doc@test.com",
            role: "doctor",
            image: "https://cdn.example/portal-owner.png",
          },
        },
        "doc-1",
        []
      )
    ).toBe("https://cdn.example/portal-owner.png");
  });
});
