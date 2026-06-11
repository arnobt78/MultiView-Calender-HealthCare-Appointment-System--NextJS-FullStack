/** Record Audit on org detail — portrait + role badge (SSR first paint). */
export const orgAuditUserPick = {
  select: { id: true, display_name: true, email: true, image: true, role: true },
} as const;

/** Owner row — same pick as audit actors for avatar + role badge parity. */
export const orgOwnerUserPick = orgAuditUserPick;

export const organizationDetailInclude = {
  created_by: orgAuditUserPick,
  updated_by: orgAuditUserPick,
} as const;
