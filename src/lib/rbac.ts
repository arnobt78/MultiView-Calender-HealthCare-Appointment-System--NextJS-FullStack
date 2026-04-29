import { prisma } from "@/lib/prisma";

/** Patient accounts use portal flows; dashboard CRUD is blocked at API layer (incremental RBAC). */
export function isPatientRole(role: string | null | undefined): boolean {
  return role === "patient";
}

export async function getUserRole(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return u?.role ?? null;
}
