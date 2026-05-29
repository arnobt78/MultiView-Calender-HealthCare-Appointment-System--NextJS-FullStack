import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { API_ROUTE_FORCE_DYNAMIC } from "@/lib/api-route-dynamic";

const ROOT = join(__dirname, "..", "..", "..");
const API_ROOT = join(ROOT, "src/app/api");
const REQUIRED_LINE = `export const dynamic = "${API_ROUTE_FORCE_DYNAMIC}";`;

function collectApiRouteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...collectApiRouteFiles(full));
    else if (ent.name === "route.ts") out.push(full);
  }
  return out;
}

const API_ROUTE_FILES = collectApiRouteFiles(API_ROOT);

describe("API route segment config (force-dynamic)", () => {
    it("discovers every src/app/api route handler", () => {
    expect(API_ROUTE_FILES.length).toBeGreaterThanOrEqual(68);
  });

  for (const abs of API_ROUTE_FILES) {
    const rel = abs.replace(`${ROOT}/`, "");
    it(`${rel} exports force-dynamic literal`, () => {
      const source = readFileSync(abs, "utf8");
      expect(source).toContain(REQUIRED_LINE);
    });
  }
});
