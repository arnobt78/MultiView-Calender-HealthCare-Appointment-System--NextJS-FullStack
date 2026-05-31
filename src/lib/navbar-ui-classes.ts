/**
 * Navbar layout tokens — center nav stays one row on laptop (admin has more links than doctor/patient).
 * Pair with `useAppNavbarHeightSync` so `AuthShell` main offset tracks measured fixed chrome height.
 */

/** Center nav — nowrap links; tighter gap on md, roomier on xl. */
export const navbarCenterNavClass =
  "hidden md:flex min-w-0 flex-1 flex-nowrap items-center justify-center gap-2.5 lg:gap-4 xl:gap-6";

/** Primary nav link — no line-break inside multi-word labels (Admin Portal, Control Panel). */
export const navbarNavLinkClass =
  "shrink-0 whitespace-nowrap text-sm lg:text-base transition-colors hover:text-gray-700";

/** Logo wordmark — slightly smaller on md so admin center nav fits one row. */
export const navbarLogoTitleClass =
  "inline-block bg-linear-to-r from-emerald-900 via-red-500 to-sky-700 bg-clip-text text-base font-semibold tracking-tight text-transparent lg:text-lg";
