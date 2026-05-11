/**
 * Security Headers Configuration
 * 
 * Apply these in next.config.js → headers().
 * Includes: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
 */

/**
 * Static security headers applied via next.config.ts to every response.
 *
 * NOTE: Content-Security-Policy and X-Frame-Options are intentionally absent
 * here.  Both are set dynamically by src/proxy.ts (edge middleware) on a
 * per-route basis:
 *   - Public pages  → frame-ancestors allows vercel.com / vercel.live / *.vercel.app
 *   - Protected pages → frame-ancestors 'none' + X-Frame-Options DENY
 *
 * Duplicating them here would create conflicting header values that the browser
 * resolves by picking the most restrictive one (DENY / no-frame-ancestors),
 * which breaks Vercel's deployment preview thumbnail.
 */
export const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(), payment=(self)",
  },
];
