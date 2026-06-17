import { describe, it, expect } from "vitest";
import {
  buildStaffDirectoryMap,
  resolvePrimaryDoctorIdentity,
} from "@/lib/staff-directory-cache";

describe("staff-directory-cache", () => {
  it("resolvePrimaryDoctorIdentity prefers patient SSR portrait and specialty", () => {
    const staffById = buildStaffDirectoryMap({
      initialDoctors: {
        doctors: [
          {
            id: "doc-1",
            email: "d@test.com",
            display_name: "Dr A",
            image: null,
            specialty: null,
            bio: null,
            role: "doctor",
            created_at: "",
            availabilities: [],
            appointment_types: [],
            bookable_appointment_types: [],
            patient_count: 0,
            office_location: null,
          },
        ],
      },
    });
    const row = resolvePrimaryDoctorIdentity(
      {
        primary_doctor_id: "doc-1",
        primary_doctor_display: "Dr A",
        primary_doctor_email: "d@test.com",
        primary_doctor_specialty: "Cardiology",
        primary_doctor_image: "https://cdn.example/a.png",
      },
      staffById
    );
    expect(row?.image).toBe("https://cdn.example/a.png");
    expect(row?.specialty).toBe("Cardiology");
  });
});
