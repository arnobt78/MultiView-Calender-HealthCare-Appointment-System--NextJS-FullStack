/** Portal clinician (doctor/admin) profile access — use `@/lib/admin-portal-profile-access`. */
export {
  canViewAdminPortalProfile as canViewClinicianPortalProfile,
  type AdminPortalProfileAccessSession as ClinicianPortalAccessSession,
} from "@/lib/admin-portal-profile-access";

/** @deprecated Use `canViewClinicianPortalProfile` from this module. */
export {
  canViewAdminPortalProfile as canViewStaffPortalProfile,
  type AdminPortalProfileAccessSession as StaffPortalAccessSession,
} from "@/lib/admin-portal-profile-access";
