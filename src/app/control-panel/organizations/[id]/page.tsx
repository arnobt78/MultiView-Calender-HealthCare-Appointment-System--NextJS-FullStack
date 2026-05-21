/**
 * SSR: Organization detail page — all schema properties.
 * Server-fetches org + members, passes to client form.
 */
import { notFound } from "next/navigation";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeOrganization } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Building2, Users } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Organization — ${id.slice(0, 8)}` };
}

export default async function OrganizationDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  // Only the org owner or an existing member may view the detail page.
  const raw = await prisma.organization.findFirst({
    where: {
      id,
      OR: [
        { owner_user_id: sessionUser.userId },
        { members: { some: { user_id: sessionUser.userId } } },
      ],
    },
    include: {
      members: true,
    },
  });
  if (!raw) notFound();

  const org = serializeOrganization(raw);
  const members = raw.members;

  // Fetch users for member display names
  const userIds = members.map((m) => m.user_id).filter(Boolean);
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true, display_name: true },
      })
      : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div className="space-y-2">
      <PageHeader
        title={org.name}
        description={`Slug: ${org.slug}`}
        actions={
          <Button variant="outline" asChild>
            <BackNavigationLink href="/control-panel">
              <ArrowLeft className="h-4 w-4" />
              Back
            </BackNavigationLink>
          </Button>
        }
      />

      {/* Schema fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Schema: organizations
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            id · created_at · name · slug · owner_user_id
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs ">{org.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="">{new Date(org.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">name</dt>
              <dd className=" font-semibold">{org.name}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">slug</dt>
              <dd className=" font-mono text-xs">{org.slug}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">owner_user_id</dt>
              <dd className=" font-mono text-xs break-all">
                {userMap[org.owner_user_id]?.display_name ??
                  userMap[org.owner_user_id]?.email ??
                  org.owner_user_id}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({members.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Schema: organization_members — id · org_id · user_id · role · joined_at
          </p>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => {
                  const u = userMap[m.user_id];
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {(u?.display_name ?? u?.email ?? "?").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{u?.display_name ?? u?.email ?? "Unknown"}</p>
                            <p className="text-xs text-muted-foreground font-mono">{m.user_id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[m.role] ?? "bg-gray-100 text-gray-700"}>
                          {m.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">#{m.id.slice(0, 8)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(m.joined_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
