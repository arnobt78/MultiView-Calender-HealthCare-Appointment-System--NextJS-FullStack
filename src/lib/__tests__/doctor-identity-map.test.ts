import { describe, expect, it } from "vitest";
import { doctorSelectSearchText, userToDoctorIdentity } from "@/lib/doctor-identity-map";

describe("doctor-identity-map", () => {
  it("userToDoctorIdentity maps staff user fields", () => {
    const identity = userToDoctorIdentity({
      id: "doc-1",
      display_name: "Dr. Ada",
      email: "ada@example.com",
      image: "/img.png",
      specialty: "Cardiology",
    });
    expect(identity).toEqual({
      id: "doc-1",
      display_name: "Dr. Ada",
      email: "ada@example.com",
      image: "/img.png",
      specialty: "Cardiology",
    });
  });

  it("doctorSelectSearchText joins display fields", () => {
    expect(
      doctorSelectSearchText({
        id: "doc-1",
        display_name: "Dr. Ada",
        email: "ada@example.com",
        image: null,
        specialty: "Cardiology",
      })
    ).toBe("Dr. Ada ada@example.com Cardiology");
  });
});
