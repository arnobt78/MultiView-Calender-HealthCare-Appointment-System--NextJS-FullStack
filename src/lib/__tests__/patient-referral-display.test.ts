import { describe, expect, it } from "vitest";
import { formatPatientReferralDisplay } from "@/lib/patient-referral-display";

describe("formatPatientReferralDisplay", () => {
  it("maps patient_portal code to Patient Portal label", () => {
    expect(
      formatPatientReferralDisplay({ referral_source: "patient_portal" })
    ).toBe("Patient Portal");
  });

  it("maps control_panel code", () => {
    expect(
      formatPatientReferralDisplay({ referral_source: "control_panel" })
    ).toBe("Control Panel (Staff)");
  });

  it("appends referral_detail with em dash", () => {
    expect(
      formatPatientReferralDisplay({
        referral_source: "external_partner",
        referral_detail: "Partner Clinic Berlin",
      })
    ).toBe("External Clinic / Partner — Partner Clinic Berlin");
  });

  it("returns detail alone when source missing", () => {
    expect(
      formatPatientReferralDisplay({ referral_detail: "Walk-in" })
    ).toBe("Walk-in");
  });

  it("returns null when both empty", () => {
    expect(formatPatientReferralDisplay({})).toBeNull();
    expect(formatPatientReferralDisplay(null)).toBeNull();
    expect(formatPatientReferralDisplay(undefined)).toBeNull();
  });

  it("falls back to raw source when unknown code", () => {
    expect(
      formatPatientReferralDisplay({ referral_source: "legacy_channel" })
    ).toBe("legacy_channel");
  });
});
