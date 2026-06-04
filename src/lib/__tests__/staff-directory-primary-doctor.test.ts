import { describe, expect, it } from "vitest";
import {
  hasPrimaryDoctorProfileExtras,
  resolvePrimaryDoctorDisplayName,
  resolvePrimaryDoctorIdentity,
} from "@/lib/staff-directory-cache";

describe("hasPrimaryDoctorProfileExtras", () => {
  it("returns false when no profile fields", () => {
    expect(
      hasPrimaryDoctorProfileExtras({
        id: "d1",
        display_name: "Dr",
        email: "d@test.com",
      })
    ).toBe(false);
  });

  it("returns true when phone present", () => {
    expect(
      hasPrimaryDoctorProfileExtras({
        id: "d1",
        display_name: "Dr",
        phone: "+1",
      })
    ).toBe(true);
  });
});

describe("resolvePrimaryDoctorDisplayName", () => {
  it("falls back to treating physician email when display missing", () => {
    const name = resolvePrimaryDoctorDisplayName(
      {
        primary_doctor_id: "doc-1",
        primary_doctor_display: null,
        primary_doctor_email: "demo@doctor.com",
        primary_doctor_specialty: null,
        primary_doctor_image: null,
      },
      new Map(),
      { id: "doc-1", display_name: null, email: "demo@doctor.com" }
    );
    expect(name).toBe("demo");
  });
});

describe("resolvePrimaryDoctorIdentity with staff map", () => {
  it("uses staff directory display when patient denormalized name missing", () => {
    const map = new Map([
      [
        "doc-9",
        {
          id: "doc-9",
          display_name: "From Directory",
          email: "dir@test.com",
        },
      ],
    ]);
    const row = resolvePrimaryDoctorIdentity(
      {
        primary_doctor_id: "doc-9",
        primary_doctor_display: null,
        primary_doctor_email: null,
        primary_doctor_specialty: null,
        primary_doctor_image: null,
      },
      map
    );
    expect(row?.display_name).toBe("From Directory");
  });
});
