/**
 * Showcase demo accounts — shared password, distinct roles.
 * Used by login dropdown, /api/auth/demo, seed script, and smoke tests.
 */

export const DEMO_PASSWORD = "12345678";

/** Seeded demo personas — includes `secretary` staff (see `npm run db:seed-test-user`). */
export type DemoRole = "admin" | "doctor" | "patient" | "secretary";

export type DemoAccount = {
  email: string;
  role: DemoRole;
  label: string;
  displayName: string;
  avatarUrl: string;
};

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "test@admin.com",
    role: "admin",
    label: "Demo Admin",
    displayName: "Demo Admin",
    avatarUrl: "/users/img-1.avif",
  },
  {
    email: "test@doctor.com",
    role: "doctor",
    label: "Demo Doctor",
    displayName: "Demo Doctor",
    avatarUrl: "/doctors/img-7.jpg",
  },
  {
    email: "test@patient.com",
    role: "patient",
    label: "Demo Patient",
    displayName: "Demo Patient",
    avatarUrl: "/users/img-3.avif",
  },
  {
    email: "test@secretary.com",
    role: "secretary",
    label: "Demo Secretary",
    displayName: "Demo Secretary",
    avatarUrl: "/users/img-10.avif",
  },
] as const;

/** Primary account for automated smoke tests (admin). */
export const DEMO_SMOKE_EMAIL = "test@admin.com";
export const DEMO_DOCTOR_EMAIL = "test@doctor.com";
export const DEMO_PATIENT_EMAIL = "test@patient.com";
/** Demo secretary staff — same password as other demo rows; seeded by `db:seed-test-user`. */
export const DEMO_SECRETARY_EMAIL = "test@secretary.com";

/** Stable seeded type id used by smoke tests for slot endpoint checks. */
export const DEMO_DOCTOR_APPOINTMENT_TYPE_ID =
  "11111111-1111-4111-8111-111111111111";

export function isAllowedDemoLogin(email: string, password: string): boolean {
  if (password !== DEMO_PASSWORD) return false;
  return DEMO_ACCOUNTS.some((a) => a.email === email);
}

export function getDemoAccountByEmail(email: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((a) => a.email === email);
}
