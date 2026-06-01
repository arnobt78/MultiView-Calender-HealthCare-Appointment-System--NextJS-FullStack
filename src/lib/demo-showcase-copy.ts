/** Demo showcase callouts — intentional feature limits on CP entity pages. */

export type DemoShowcaseNoteCopy = {
  title: string;
  body: string;
};

/** Doctor management list + detail — no create/delete to protect seeded roster. */
export const DOCTOR_MANAGEMENT_DEMO_NOTE: DemoShowcaseNoteCopy = {
  title: "Seeded doctor roster",
  body: "Profiles are pre-loaded for scheduling demos. You can view, edit, and deactivate; add and delete stay disabled in this build.",
};

/** User admin tab — B2B admins only; demo doctors/patients on dedicated tabs. */
export const ADMIN_USER_MANAGEMENT_DEMO_NOTE: DemoShowcaseNoteCopy = {
  title: "B2B admin accounts only",
  body: "New sign-ups via register or Google receive the admin role. Demo doctors and patients are managed on Doctor Management and Patient Management — they are not listed here.",
};
