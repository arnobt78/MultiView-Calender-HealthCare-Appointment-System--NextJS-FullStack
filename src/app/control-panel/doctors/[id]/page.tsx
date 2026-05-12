/**
 * Doctor Detail Page — profile, specialty, bio, availability, assigned patients, types
 * Accessible to: admin (any doctor), doctor (own profile only)
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
import { DoctorAppointmentTypesEditor } from "@/components/control-panel/DoctorAppointmentTypesEditor";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Clock,
  Hash,
  Mail,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const doc = await prisma.user.findUnique({ where: { id }, select: { display_name: true } });
  return { title: doc?.display_name ? `Dr. ${doc.display_name}` : `Doctor — ${id.slice(0, 8)}` };
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
function minToTime(m: number) {
  return `${Math.floor(m / 60).toString().padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
}

export default async function DoctorDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const callerRole = await getUserRole(sessionUser.userId);
  // Allow self-view (any role), admin can view any
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
      doctor_availabilities: {
        orderBy: { weekday: "asc" },
      },
      appointment_types_owned: {
        orderBy: { name: "asc" },
      },
      patients_primary_doctor: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          active: true,
        },
        orderBy: { firstname: "asc" },
        take: 20,
      },
    },
  });
  if (!raw) notFound();

  return (
    <div className="space-y-5 text-gray-700">
      <PageHeader
        title={raw.display_name ?? raw.email}
        description={raw.specialty ? `${raw.specialty} · Doctor Profile` : "Doctor Profile"}
        actions={
          <Button variant="outline" asChild size="sm">
            <Link href="/control-panel/doctor-management">
              <ArrowLeft className="h-4 w-4" />
              Back to Doctors
            </Link>
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-5">
        {/* Left: Profile card */}
        <div className="space-y-4">
          <Card className="rounded-[20px] border bg-card shadow-[0_8px_32px_rgba(2,132,199,0.1)] overflow-hidden">
            <CardHeader className="pb-2 bg-sky-50/60 border-b border-sky-100/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-sky-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 border border-sky-200">
                  <User className="h-3.5 w-3.5 text-sky-600" />
                </span>
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Photo + name */}
              <div className="flex items-start gap-3">
                {raw.image ? (
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden ring-2 ring-sky-200 shrink-0">
                    <Image src={raw.image} alt={raw.display_name ?? "doctor"} fill className="object-cover" sizes="80px" />
                  </div>
                ) : (
                  <UserAvatar src={null} fallbackText={raw.display_name || raw.email || "?"} sizeClassName="h-20 w-20" className="text-lg ring-2 ring-sky-200 rounded-xl" />
                )}
                <div className="min-w-0">
                  <p className="font-bold leading-tight">{raw.display_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{raw.email}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {raw.role && (
                      <Badge variant="outline" className="text-[10px] py-0 capitalize bg-sky-50 text-sky-700 border-sky-200">
                        {raw.role}
                      </Badge>
                    )}
                    {raw.specialty && (
                      <Badge variant="outline" className="text-[10px] py-0 bg-indigo-50 text-indigo-700 border-indigo-200">
                        <Stethoscope className="h-2.5 w-2.5 mr-0.5" />
                        {raw.specialty}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {raw.bio && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Bio
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{raw.bio}</p>
                </div>
              )}

              <Separator />

              {/* Quick info */}
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
                    <dd>{raw.created_at.toLocaleDateString()}</dd>
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

        {/* Right: Availability + Appointment Types + Patients */}
        <div className="md:col-span-2 space-y-5">
          {/* Availability windows */}
          <Card className="rounded-[20px] border bg-card shadow-[0_4px_20px_rgba(139,92,246,0.1)] overflow-hidden">
            <CardHeader className="pb-2 bg-violet-50/60 border-b border-violet-100/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 border border-violet-200">
                  <CalendarClock className="h-3.5 w-3.5 text-violet-600" />
                </span>
                Availability Schedule
                <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-bold ml-1">
                  {raw.doctor_availabilities.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {raw.doctor_availabilities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No availability windows set.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {raw.doctor_availabilities.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg border bg-violet-50/40 px-3 py-2 text-xs">
                      <Badge variant="outline" className="text-[10px] py-0 bg-white border-violet-200 text-violet-700 min-w-12 justify-center">
                        {WEEKDAY_SHORT[a.weekday]}
                      </Badge>
                      <span className="font-medium">{minToTime(a.start_min)} – {minToTime(a.end_min)}</span>
                      <span className="text-muted-foreground truncate">{a.timezone}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment types */}
          <Card className="rounded-[20px] border bg-card shadow-[0_4px_20px_rgba(16,185,129,0.1)] overflow-hidden">
            <CardHeader className="pb-2 bg-emerald-50/60 border-b border-emerald-100/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 border border-emerald-200">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                </span>
                Appointment Types
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold ml-1">
                  {raw.appointment_types_owned.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <DoctorAppointmentTypesEditor doctorId={raw.id} />
            </CardContent>
          </Card>

          {/* Assigned patients */}
          <Card className="rounded-[20px] border bg-card shadow-[0_4px_20px_rgba(245,158,11,0.1)] overflow-hidden">
            <CardHeader className="pb-2 bg-amber-50/60 border-b border-amber-100/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 border border-amber-200">
                  <Users className="h-3.5 w-3.5 text-amber-600" />
                </span>
                Assigned Patients
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold ml-1">
                  {raw.patients_primary_doctor.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {raw.patients_primary_doctor.length === 0 ? (
                <p className="text-sm text-muted-foreground">No patients assigned as primary doctor.</p>
              ) : (
                <div className="space-y-2">
                  {raw.patients_primary_doctor.map((p) => (
                    <Link
                      key={p.id}
                      href={`/control-panel/patients/${p.id}`}
                      className="flex items-center justify-between rounded-lg border bg-amber-50/40 hover:bg-amber-100/50 px-3 py-2 text-xs transition-colors"
                    >
                      <span className="font-medium">{p.firstname} {p.lastname}</span>
                      <div className="flex items-center gap-2">
                        {p.email && <span className="text-muted-foreground">{p.email}</span>}
                        <Badge variant="outline" className={`text-[10px] py-0 ${p.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {p.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
