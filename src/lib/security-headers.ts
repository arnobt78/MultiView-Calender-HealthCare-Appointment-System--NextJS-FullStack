/**
 * Security Headers Configuration
 * 
 * Apply these in next.config.js → headers().
 * Includes: CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
 */

export const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://meet.jit.si https://vercel.live https://vercel.com",
      "script-src-elem 'self' 'unsafe-inline' https://meet.jit.si https://vercel.live https://vercel.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://api.stripe.com https://*.upstash.io https://meet.jit.si https://vercel.live https://vercel.com",
      "frame-src 'self' https://meet.jit.si https://checkout.stripe.com https://vercel.live https://vercel.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
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
