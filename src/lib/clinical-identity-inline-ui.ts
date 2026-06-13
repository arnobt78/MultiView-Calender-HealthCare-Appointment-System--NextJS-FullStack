/**
 * Shared layout tokens for inline patient/doctor/admin identity rows on entity detail pages.
 * Keeps avatar size, row gap, and inner text/badge alignment consistent across Related People,
 * linked visit panels, and Record Audit actor rows.
 */

/** Inline avatar — matches `DoctorIdentityRow` `size="sm"`. */
export const clinicalIdentityInlineAvatarClass = "h-7 w-7";

/** Outer flex row: avatar + name/email/badge cluster. */
export const clinicalIdentityInlineRowClass =
  "flex min-w-0 flex-wrap items-center gap-2";

/** Inner cluster: name, email, age, role, specialty, care tier badges. */
export const clinicalIdentityInlineInnerClass =
  "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1";

/** Name link/text — matches `DoctorIdentityRow` inline (`shrink-0`, no `self-start`). */
export const clinicalIdentityInlineNameClass = "shrink-0 text-sm font-normal";

/** Role, specialty, age, care tier pills — grouped like doctor `badgeRow`. */
export const clinicalIdentityInlineBadgeRowClass =
  "flex min-w-0 flex-wrap items-center gap-1.5";

/** CP invoice table — avatar left, two text rows (name+email, then badges). */
export const clinicalIdentityCompactStackRowClass =
  "flex min-w-0 items-start gap-2";

export const clinicalIdentityCompactStackTextColClass =
  "flex min-w-0 flex-1 flex-col justify-center gap-0.5";

export const clinicalIdentityCompactStackNameEmailRowClass =
  "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0";

export const clinicalIdentityCompactStackBadgeRowClass =
  "flex min-w-0 flex-wrap items-center gap-1";

/** Doctor/admin compactStack avatar — `DoctorIdentityRow` `size="sm"` (CP invoice table). */
export const clinicalIdentityCompactStackStaffAvatarClass = "h-7 w-7";
