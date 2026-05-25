/**
 * Edge-safe role landing — proxy sends authenticated `/login` visitors here so we can
 * resolve portal vs dashboard without embedding role in the JWT.
 */

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { resolveRoleHomeHref } from "@/lib/role-home-href";

export default async function RoleHomePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  const role = await getUserRole(session.userId);
  redirect(resolveRoleHomeHref(role));
}
