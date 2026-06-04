/** Record Audit on category detail — portrait + role badge (SSR first paint). */
export const categoryAuditUserPick = {
  select: { id: true, display_name: true, email: true, image: true, role: true },
} as const;

/** Prisma include for category detail GET + SSR prefetch (audit actor labels). */
export const categoryDetailInclude = {
  created_by: categoryAuditUserPick,
  updated_by: categoryAuditUserPick,
} as const;
