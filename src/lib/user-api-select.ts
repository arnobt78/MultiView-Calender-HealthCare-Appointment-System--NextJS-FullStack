/**
 * Shared Prisma `select` for user list + detail + SSR prefetch.
 * Keep in sync with `serializeUser` — doctor-management list Edit must not lose v006 fields on refetch/save.
 */
export const USER_API_SELECT = {
  id: true,
  email: true,
  display_name: true,
  role: true,
  image: true,
  specialty: true,
  bio: true,
  phone: true,
  license_number: true,
  department: true,
  consultation_fee: true,
  office_location: true,
  languages_spoken: true,
  years_of_experience: true,
  is_active: true,
  active_since: true,
  email_verified: true,
  created_at: true,
  updated_at: true,
  created_by_id: true,
  updated_by_id: true,
} as const;
