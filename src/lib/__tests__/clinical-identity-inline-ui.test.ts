import { describe, expect, it } from "vitest";
import {
  clinicalIdentityInlineAvatarClass,
  clinicalIdentityInlineBadgeRowClass,
  clinicalIdentityInlineInnerClass,
  clinicalIdentityInlineNameClass,
  clinicalIdentityInlineRowClass,
} from "@/lib/clinical-identity-inline-ui";
import {
  entityDetailDefinitionIdentityRowClass,
  entityDetailDefinitionIdentityValueClass,
} from "@/lib/patient-detail-ui-classes";

describe("clinical-identity-inline-ui", () => {
  it("exports shared inline identity layout tokens", () => {
    expect(clinicalIdentityInlineAvatarClass).toBe("h-7 w-7");
    expect(clinicalIdentityInlineRowClass).toContain("gap-2");
    expect(clinicalIdentityInlineInnerClass).toContain("gap-x-1.5");
    expect(clinicalIdentityInlineNameClass).toContain("shrink-0");
    expect(clinicalIdentityInlineBadgeRowClass).toContain("gap-1.5");
  });

  it("exports identity definition row center-align tokens", () => {
    expect(entityDetailDefinitionIdentityRowClass).toContain("sm:items-center");
    expect(entityDetailDefinitionIdentityValueClass).toContain("flex items-center");
  });
});
