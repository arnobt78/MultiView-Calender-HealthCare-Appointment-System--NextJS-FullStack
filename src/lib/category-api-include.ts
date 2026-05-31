/** User pick for category detail audit rows (created_by / updated_by). */
export const categoryUserPick = {
  select: { display_name: true, email: true, specialty: true },
} as const;

/** Prisma include for category detail GET + SSR prefetch (audit actor labels). */
export const categoryDetailInclude = {
  created_by: categoryUserPick,
  updated_by: categoryUserPick,
} as const;
