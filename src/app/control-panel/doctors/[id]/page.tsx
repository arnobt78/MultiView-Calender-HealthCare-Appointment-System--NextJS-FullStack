/**
 * SSR: User account detail (all roles share this route).
 * Server fetches the user via Prisma; DoctorDetailForm edits profile fields.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeUser } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { ArrowLeft } from "lucide-react";
import { DoctorDetailForm } from "@/components/control-panel/DoctorDetailForm";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `User — ${id.slice(0, 8)}` };
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  // Self-lookup always allowed; admin may view any user record.
  // Doctors/secretaries can only view their own profile page.
  const callerRole = await getUserRole(sessionUser.userId);
  if (id !== sessionUser.userId && callerRole !== "admin") notFound();

  const raw = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      display_name: true,
      role: true,
      image: true,
      created_at: true,
    },
  });
  if (!raw) notFound();

  const user = serializeUser(raw);

  const roleNorm = (user.role ?? "").toLowerCase();
  const listBackHref =
    roleNorm === "doctor"
      ? "/control-panel/doctor-management"
      : roleNorm === "admin" || roleNorm === "secretary"
        ? "/control-panel/user-admin-management"
        : "/control-panel/dashboard-overview";

  return (
    <div className="space-y-2 text-gray-700">
      <PageHeader
        title={user.display_name ?? user.email ?? "User"}
        description="User account — all listed schema properties"
        actions={
          <Button variant="outline" asChild>
            <Link href={listBackHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Schema: users</CardTitle>
          <p className="text-sm text-muted-foreground">
            id · email · role · display_name · image · created_at
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile avatar */}
          <div className="flex items-center gap-4">
            <UserAvatar
              src={user.image}
              fallbackText={user.display_name || user.email || "?"}
              sizeClassName="h-16 w-16"
              className="text-base"
            />
            <div>
              <p className="font-semibold text-lg">{user.display_name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.role && (
                <Badge variant="outline" className="mt-1 capitalize">
                  {user.role}
                </Badge>
              )}
            </div>
          </div>

          {/* All schema fields */}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs mt-0.5">{user.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">email</dt>
              <dd className="mt-0.5">{user.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">display_name</dt>
              <dd className="mt-0.5">{user.display_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">role</dt>
              <dd className="mt-0.5 capitalize">{user.role ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">image</dt>
              <dd className="mt-0.5 truncate">{user.image ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="mt-0.5">{user.created_at ? new Date(user.created_at).toLocaleString() : "—"}</dd>
            </div>
          </dl>

          {/* Edit form (client component) */}
          <DoctorDetailForm initialUser={user} />
        </CardContent>
      </Card>
    </div>
  );
}

