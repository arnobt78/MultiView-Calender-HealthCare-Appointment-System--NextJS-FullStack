/**
 * User Detail Page — avatar, role, account info
 * Color scheme: slate/gray
 * Accessible to: admin (any user), user themselves
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole } from "@/lib/rbac";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Separator } from "@/components/ui/separator";
import { DoctorDetailForm } from "@/components/control-panel/DoctorDetailForm";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Hash,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { format } from "date-fns";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const u = await prisma.user.findUnique({ where: { id }, select: { display_name: true, email: true } });
  return { title: u?.display_name ?? u?.email ?? `User — ${id.slice(0, 8)}` };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

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
      specialty: true,
      bio: true,
      created_at: true,
      email_verified: true,
    },
  });
  if (!raw) notFound();

  const appointmentCount = await prisma.appointment.count({ where: { owner_id: id } });

  const backHref =
    raw.role === "doctor"
      ? "/control-panel/doctor-management"
      : "/control-panel/user-admin-management";

  return (
    <div className="space-y-5 text-gray-700">
      <PageHeader
        title={raw.display_name ?? raw.email}
        description={`${raw.role ? raw.role.charAt(0).toUpperCase() + raw.role.slice(1) : "User"} Account`}
        actions={
          <Button variant="outline" asChild size="sm">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 gap-5">
        {/* Profile card */}
        <Card className="rounded-[20px] border bg-card shadow-[0_8px_32px_rgba(100,116,139,0.12)] overflow-hidden">
          <CardHeader className="pb-2 bg-slate-50/60 border-b border-slate-100/60">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                <User className="h-3.5 w-3.5 text-slate-600" />
              </span>
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <UserAvatar
                src={raw.image}
                fallbackText={raw.display_name || raw.email || "?"}
                sizeClassName="h-16 w-16"
                className="text-base ring-2 ring-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-bold leading-tight">{raw.display_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{raw.email}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {raw.role && (
                    <Badge variant="outline" className="text-[10px] py-0 capitalize bg-slate-50 text-slate-700 border-slate-200">
                      <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />
                      {raw.role}
                    </Badge>
                  )}
                  <Badge variant="outline" className={`text-[10px] py-0 ${raw.email_verified ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    {raw.email_verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <dl className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                  <Hash className="h-2.5 w-2.5 text-muted-foreground" />
                </span>
                <div>
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono text-[10px] break-all">{raw.id}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                  <Mail className="h-2.5 w-2.5 text-muted-foreground" />
                </span>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{raw.email}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                </span>
                <div>
                  <dt className="text-muted-foreground">Joined</dt>
                  <dd>{format(raw.created_at, "dd MMM yyyy")}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                  <CalendarDays className="h-2.5 w-2.5 text-muted-foreground" />
                </span>
                <div>
                  <dt className="text-muted-foreground">Appointments Owned</dt>
                  <dd className="font-medium">{appointmentCount}</dd>
                </div>
              </div>
            </dl>

            {/* Edit form (admin only) */}
            {callerRole === "admin" && (
              <>
                <Separator />
                <DoctorDetailForm initialUser={{ ...raw, created_at: raw.created_at.toISOString() }} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
