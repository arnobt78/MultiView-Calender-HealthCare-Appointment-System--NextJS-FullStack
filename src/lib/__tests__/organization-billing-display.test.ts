import { describe, expect, it } from "vitest";
import {
  ORGANIZATION_BILLING_SUBTITLE,
  organizationBillingSectionTitle,
} from "@/lib/organization-billing-display";

describe("organizationBillingSectionTitle", () => {
  it("uses possessive org name when present", () => {
    expect(organizationBillingSectionTitle("HealthCal Demo Clinic")).toBe(
      "HealthCal Demo Clinic's Related Billing"
    );
  });

  it("falls back when name missing", () => {
    expect(organizationBillingSectionTitle(undefined)).toBe("Related Billing");
  });
});

describe("ORGANIZATION_BILLING_SUBTITLE", () => {
  it("describes org-tagged invoice scope", () => {
    expect(ORGANIZATION_BILLING_SUBTITLE).toContain("organisation");
  });
});
