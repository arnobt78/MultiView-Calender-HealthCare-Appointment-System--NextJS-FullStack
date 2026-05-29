/**
 * Canonical `dynamic` segment config for App Router API route handlers.
 *
 * Each `src/app/api/.../route.ts` must include the string literal (Next.js rejects imports/re-exports):
 *   `export const dynamic = "force-dynamic";`
 *
 * Enforcement: `src/__tests__/lib/api-route-dynamic.test.ts` walks all API routes.
 */
export const API_ROUTE_FORCE_DYNAMIC = "force-dynamic" as const;
