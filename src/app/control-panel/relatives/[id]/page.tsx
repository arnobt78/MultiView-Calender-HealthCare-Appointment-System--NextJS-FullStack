/**
 * Relative Detail Page — full profile with relationship, contact info, emergency status
 * Color scheme: teal/cyan
 * Accessible to: admin, doctor, secretary
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isStaffRole } from "@/lib/rbac";
import { serializeRelative } from "@/lib/serializers";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowLeft,
  Cake,
  Hash,
  Heart,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { format } from "date-fns";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const r = await prisma.relative.findUnique({ where: { id }, select: { firstname: true, lastname: true } });
  return { title: r ? `${r.firstname} ${r.lastname}` : `Relative — ${id.slice(0, 8)}` };
}

export default async function RelativeDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const callerRole = await getUserRole(sessionUser.userId);
  if (!isStaffRole(callerRole)) notFound();

  const raw = await prisma.relative.findUnique({ where: { id } });
  if (!raw) notFound();

  const rel = serializeRelative(raw);

  // Linked patient (if patient_id is set)
  const linkedPatient = raw.patient_id
    ? await prisma.patient.findUnique({
        where: { id: raw.patient_id },
        select: { id: true, firstname: true, lastname: true, email: true, active: true },
      })
    : null;

  return (
    <div className="space-y-5 text-gray-700">
      <PageHeader
        title={`${rel.firstname} ${rel.lastname}`}
        description={rel.relationship ? `${rel.relationship} · Relative Record` : "Relative Record"}
        actions={
          <Button variant="outline" asChild size="sm">
            <Link href="/control-panel/relative-management">
              <ArrowLeft className="h-4 w-4" />
              Back to Relatives
            </Link>
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 gap-5">
        {/* Left: Main info card */}
        <Card className="rounded-[20px] border bg-card shadow-[0_8px_32px_rgba(20,184,166,0.12)] overflow-hidden">
          <CardHeader className="pb-2 bg-teal-50/60 border-b border-teal-100/60">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-teal-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 border border-teal-200">
                <User className="h-3.5 w-3.5 text-teal-600" />
              </span>
              Relative Profile
              {rel.is_emergency_contact && (
                <Badge variant="outline" className="text-[10px] py-0 bg-red-50 text-red-700 border-red-200 ml-auto">
                  <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                  Emergency Contact
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Name + initials */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-100 border border-teal-200 text-teal-700 font-bold text-lg">
                {rel.firstname[0]}{rel.lastname[0]}
              </div>
              <div>
                <p className="font-bold text-base leading-tight">{rel.firstname} {rel.lastname}</p>
                {rel.pronoun && <p className="text-xs text-muted-foreground">{rel.pronoun}</p>}
                {rel.relationship && (
                  <Badge variant="outline" className="text-[10px] py-0 bg-teal-50 text-teal-700 border-teal-200 mt-1">
                    <Heart className="h-2.5 w-2.5 mr-0.5" />
                    {rel.relationship}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                </span>
                <div>
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono text-[10px] break-all">{rel.id}</dd>
                </div>
              </div>

              {rel.email && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 border border-sky-100 shrink-0">
                    <Mail className="h-3 w-3 text-sky-500" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="font-medium">{rel.email}</dd>
                  </div>
                </div>
              )}

              {rel.phone && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-50 border border-violet-100 shrink-0">
                    <Phone className="h-3 w-3 text-violet-500" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{rel.phone}</dd>
                  </div>
                </div>
              )}

              {rel.date_of_birth && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 border border-orange-100 shrink-0">
                    <Cake className="h-3 w-3 text-orange-500" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Date of Birth</dt>
                    <dd className="font-medium">{format(new Date(rel.date_of_birth), "dd MMM yyyy")}</dd>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                </span>
                <div>
                  <dt className="text-muted-foreground">Added</dt>
                  <dd>{format(new Date(rel.created_at), "dd MMM yyyy")}</dd>
                </div>
              </div>
            </dl>

            {rel.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rel.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right: Linked patient */}
        <Card className="rounded-[20px] border bg-card shadow-[0_4px_20px_rgba(20,184,166,0.1)] overflow-hidden">
          <CardHeader className="pb-2 bg-teal-50/60 border-b border-teal-100/60">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-teal-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 border border-teal-200">
                <Users className="h-3.5 w-3.5 text-teal-600" />
              </span>
              Linked Patient
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {linkedPatient ? (
              <Link
                href={`/control-panel/patients/${linkedPatient.id}`}
                className="flex items-center justify-between rounded-lg border bg-teal-50/40 hover:bg-teal-100/50 px-3 py-3 text-sm transition-colors"
              >
                <div>
                  <p className="font-medium">{linkedPatient.firstname} {linkedPatient.lastname}</p>
                  {linkedPatient.email && <p className="text-xs text-muted-foreground">{linkedPatient.email}</p>}
                </div>
                <Badge variant="outline" className={`text-[10px] py-0 ${linkedPatient.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  {linkedPatient.active ? "Active" : "Inactive"}
                </Badge>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No patient record linked to this relative.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
