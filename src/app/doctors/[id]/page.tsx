/**
 * Doctor profile for portal users — `/doctors/:id`.
 * Doctor: self or clinically related colleagues. Patient: primary doctor only.
 */
export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { doctorDetailHref, patientDetailHrefWithContext } from "@/lib/entity-routes";
import { canViewDoctorPortalProfile } from "@/lib/doctor-access";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { appPortalSectionRootClass } from "@/lib/section-page-layout";
import { ArrowLeft, Stethoscope } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalDoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const role = await getUserRole(sessionUser.userId);
  if (isAdminRole(role)) redirect(doctorDetailHref(role, id));

  const canView = await canViewDoctorPortalProfile(
    { userId: sessionUser.userId, email: sessionUser.email, role },
    id
  );
  if (!canView) notFound();

  const doc = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      display_name: true,
      specialty: true,
      bio: true,
      image: true,
      patients_primary_doctor: {
        select: { id: true, firstname: true, lastname: true },
        take: 20,
        orderBy: { firstname: "asc" },
      },
    },
  });
  if (!doc) notFound();

  /** Directory links from `/services` — back to catalog for all portal roles. */
  const backHref =
    role === "patient" ? "/services" : role === "doctor" ? "/services" : "/dashboard";

  const viewerIsProfileDoctor = sessionUser.userId === doc.id;

  return (
    <div className={appPortalSectionRootClass}>
      <PageHeader
        title={doc.display_name ?? doc.email}
        description={doc.specialty ?? "Doctor profile"}
        actions={
          <Button variant="outline" asChild size="sm">
            <BackNavigationLink href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </BackNavigationLink>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <UserAvatar
              src={doc.image}
              fallbackText={(doc.display_name ?? doc.email).slice(0, 2)}
              sizeClassName="h-16 w-16"
            />
            <div>
              <p className="font-semibold">{doc.display_name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{doc.email}</p>
              {doc.specialty && <p className="text-sm">{doc.specialty}</p>}
            </div>
          </div>
          {doc.bio && <p className="text-sm text-muted-foreground">{doc.bio}</p>}
          {doc.patients_primary_doctor.length > 0 && isDoctorRole(role) && (
            <div>
              <p className="text-sm font-medium mb-2">Patients</p>
              <ul className="space-y-1">
                {doc.patients_primary_doctor.map((p) => (
                  <li key={p.id}>
                    <EntityTitleLink
                      href={patientDetailHrefWithContext(
                        role,
                        p.id,
                        viewerIsProfileDoctor ? null : doc.id
                      )}
                      label={`${p.firstname} ${p.lastname}`}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
