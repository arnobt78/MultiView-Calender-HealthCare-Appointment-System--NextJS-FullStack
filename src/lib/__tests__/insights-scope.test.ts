import { describe, expect, it } from "vitest";
import {
  buildInsightsQueryString,
  defaultInsightsFilterForRole,
  defaultInsightsQueryForRole,
  insightsFilterKeyStable,
  parseInsightsFilterFromSearchParams,
  parseInsightsQueryFromSearchParams,
  resolveInsightsDataOptions,
} from "@/lib/insights-scope";

const DOCTOR_ID = "11111111-1111-1111-1111-111111111111";
const OTHER_DOCTOR = "22222222-2222-2222-2222-222222222222";
const SESSION = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

describe("defaultInsightsFilterForRole", () => {
  it("doctor defaults to personal", () => {
    expect(defaultInsightsFilterForRole("doctor")).toEqual({ scope: "personal" });
  });

  it("admin defaults to organization", () => {
    expect(defaultInsightsFilterForRole("admin")).toEqual({ scope: "organization" });
  });
});

describe("buildInsightsQueryString", () => {
  it("includes scope and doctorId when set", () => {
    const qs = buildInsightsQueryString({
      scope: "personal",
      period: "month",
      doctorId: DOCTOR_ID,
    });
    expect(qs).toContain("scope=personal");
    expect(qs).toContain(`doctorId=${DOCTOR_ID}`);
  });

  it("omits doctorId for organization", () => {
    const qs = buildInsightsQueryString({ scope: "organization", period: "month" });
    expect(qs).toContain("scope=organization");
    expect(qs).toContain("period=month");
  });
});

describe("parseInsightsFilterFromSearchParams", () => {
  it("doctorId forces personal scope", () => {
    const filter = parseInsightsFilterFromSearchParams(
      { scope: "organization", doctorId: DOCTOR_ID },
      "admin"
    );
    expect(filter).toEqual({ scope: "personal", doctorId: DOCTOR_ID });
  });

  it("falls back to role default when scope missing", () => {
    expect(parseInsightsFilterFromSearchParams({}, "doctor")).toEqual({
      scope: "personal",
    });
  });
});

describe("resolveInsightsDataOptions", () => {
  it("doctor personal uses session id", () => {
    expect(
      resolveInsightsDataOptions(SESSION, { scope: "personal" }, "doctor")
    ).toEqual({ organizationWide: false, filterOwnerId: SESSION });
  });

  it("doctor organization is global", () => {
    expect(
      resolveInsightsDataOptions(SESSION, { scope: "organization" }, "doctor")
    ).toEqual({ organizationWide: true, filterOwnerId: SESSION });
  });

  it("admin with doctorId filters target doctor", () => {
    expect(
      resolveInsightsDataOptions(
        SESSION,
        { scope: "personal", doctorId: DOCTOR_ID },
        "admin"
      )
    ).toEqual({ organizationWide: false, filterOwnerId: DOCTOR_ID });
  });

  it("admin organization is global", () => {
    expect(
      resolveInsightsDataOptions(SESSION, { scope: "organization" }, "admin")
    ).toEqual({ organizationWide: true, filterOwnerId: SESSION });
  });
});

describe("insightsFilterKeyStable", () => {
  it("drops empty doctorId", () => {
    expect(
      insightsFilterKeyStable({ scope: "personal", period: "month", doctorId: "" })
    ).toEqual({ scope: "personal", period: "month" });
  });

  it("includes period in stable key", () => {
    expect(
      insightsFilterKeyStable({ scope: "organization", period: "week" })
    ).toEqual({ scope: "organization", period: "week" });
  });
});

describe("parseInsightsQueryFromSearchParams", () => {
  it("merges scope and period", () => {
    expect(
      parseInsightsQueryFromSearchParams({ scope: "personal", period: "day" }, "doctor")
    ).toEqual({ scope: "personal", period: "day" });
  });

  it("default query for admin", () => {
    expect(defaultInsightsQueryForRole("admin")).toEqual({
      scope: "organization",
      period: "month",
    });
  });
});
