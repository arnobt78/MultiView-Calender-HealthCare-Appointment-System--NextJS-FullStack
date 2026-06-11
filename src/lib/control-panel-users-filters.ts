/** Shared useUsers filters for control-panel SSR seed + management tabs — keys must match exactly. */
export const CP_DOCTOR_USERS_FILTERS = { role: "doctor", limit: 200 } as const;
/** B2B admin roster — email/password + Google sign-ups (role=admin only). */
export const CP_ADMIN_USERS_FILTERS = { role: "admin", limit: 200 } as const;
/** Org member pickers — all roles when assigning users to organizations. */
export const CP_ALL_USERS_FILTERS = { limit: 200 } as const;
/** Org create — optional initial portal patient member. */
export const CP_PATIENT_USERS_FILTERS = { role: "patient", limit: 200 } as const;
