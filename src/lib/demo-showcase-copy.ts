/** Demo showcase callouts — intentional feature limits on CP entity pages. */

export type DemoShowcaseNoteCopy = {
  title: string;
  body: string;
};

/** Doctor management list + detail — no create/delete to protect seeded roster. */
export const DOCTOR_MANAGEMENT_DEMO_NOTE: DemoShowcaseNoteCopy = {
  title: "Demo showcase — doctor roster is fixed",
  body: "HealthCal Pro is a portfolio demo. Doctors are seeded for /services, booking, and scheduling demos. You can view, edit, and deactivate profiles — adding or deleting doctors is intentionally disabled so the showcase stays stable.",
};
