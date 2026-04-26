/**
 * SSR: Doctor / User detail page.
 * Server fetches the user via Prisma, passes to client component for editing.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeUser } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { DoctorDetailForm } from "@/components/control-panel/DoctorDetailForm";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Doctor / User — ${id.slice(0, 8)}` };
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

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

  return (
    <div className="max-w-9xl mx-auto  space-y-2 px-2 sm:px-4 lg:px-8">
      <PageHeader
        title={user.display_name ?? user.email ?? "User"}
        description="Doctor / User — all table schema properties"
        actions={
          <Button variant="outline" asChild>
            <Link href="/control-panel">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} alt="" />
              <AvatarFallback className="text-lg">
                {(user.display_name || user.email || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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

