/**
 * Vitest configuration for HealthCal Pro.
 * Runs unit + integration tests for lib utilities and API-route logic.
 * Does NOT require a running Next.js server — pure Node/ESM environment.
 */
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    /** Isolate each test file so module-level singletons (prisma, redis) don't bleed. */
    isolate: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/app/api/**"],
      exclude: ["src/lib/supabase*", "src/lib/postgresClient*"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
