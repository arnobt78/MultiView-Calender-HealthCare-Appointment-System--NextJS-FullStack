import { describe, expect, it } from "vitest";
import { buildInsightsRedisCacheKey } from "@/lib/insights/insights-redis-cache";

describe("buildInsightsRedisCacheKey", () => {
  it("includes viewer, version, scope, period, and doctor segment", () => {
    const key = buildInsightsRedisCacheKey("user-1", "3", {
      scope: "personal",
      period: "month",
      doctorId: "doc-9",
    });
    expect(key).toBe("insights:v1:user-1:3:personal:month:doc-9");
  });

  it("uses none when doctorId omitted", () => {
    const key = buildInsightsRedisCacheKey("user-1", "0", {
      scope: "organization",
      period: "year",
    });
    expect(key).toBe("insights:v1:user-1:0:organization:year:none");
  });
});
