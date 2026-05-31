/**
 * Copy for CP dev-stub UI — actions/routes exist; demo keeps submit disabled.
 * Wire `useUsers` offset/limit or POST handlers to enable in production forks.
 */

export type CpDevStubCopy = {
  /** Shown under disabled submit / confirm */
  note: string;
  /** API route hint for implementers */
  apiHint: string;
};

/** `GET /api/users?role=doctor&limit=&offset=` — demo caps at CP_DOCTOR_USERS_FILTERS.limit */
export const CP_DOCTOR_LIST_PAGINATION_STUB: CpDevStubCopy = {
  apiHint: "GET /api/users?role=doctor&limit=&offset=",
  note: "Demo loads the first 200 doctors. Pagination API is ready — bump offset on useUsers filters and SSR prefetch to load more.",
};

export const CP_ADMIN_LIST_PAGINATION_STUB: CpDevStubCopy = {
  apiHint: "GET /api/users?role=admin&limit=&offset=",
  note: "Demo loads the first 200 admin accounts. Pagination API is ready — wire offset on CP_ADMIN_USERS_FILTERS.",
};

/** Doctor roster is seed-only in demo — PATCH works; create/delete routes exist for prod forks */
export const CP_DOCTOR_CREATE_STUB: CpDevStubCopy = {
  apiHint: "POST /api/auth/register (role=doctor) or admin invite flow",
  note: "Demo keeps the seeded doctor roster stable. Form preview only — enable POST + invalidateUsersAndAuth in a production fork.",
};

export const CP_DOCTOR_DELETE_STUB: CpDevStubCopy = {
  apiHint: "DELETE /api/users/[id] (not exposed in demo UI)",
  note: "Demo uses Deactivate instead of delete. DELETE handler can be wired with invalidateUsersAndAuth + doctor directory bust.",
};

/** Admins self-register — no CP create form in demo */
export const CP_ADMIN_CREATE_STUB: CpDevStubCopy = {
  apiHint: "POST /api/auth/register · POST /api/auth/callback/google",
  note: "New B2B admins register via /register or Google sign-in (role=admin). CP create is preview-only in demo.",
};
