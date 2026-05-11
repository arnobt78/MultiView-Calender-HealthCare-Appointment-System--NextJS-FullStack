/**
 * Category Detail Page — label, description, color, duration, appointments using this category
 * Color scheme: amber/orange
 * Accessible to: admin, doctor, secretary
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Clock,
  Hash,
  Layers,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const cat = await prisma.category.findUnique({ where: { id }, select: { label: true } });
  return { title: cat?.label ? `Category: ${cat.label}` : `Category — ${id.slice(0, 8)}` };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const callerRole = await getUserRole(sessionUser.userId);
  if (!["admin", "doctor", "secretary"].includes(callerRole ?? "")) notFound();

  const cat = await prisma.category.findUnique({
    where: { id },
  });
  if (!cat) notFound();

  // Appointments using this category (recent 15)
  const appointments = await prisma.appointment.findMany({
    where: { category_id: id },
    orderBy: { start: "desc" },
    take: 15,
    select: {
      id: true,
      title: true,
      start: true,
      end: true,
      status: true,
      owner: { select: { display_name: true, email: true } },
    },
  });

  const totalCount = await prisma.appointment.count({ where: { category_id: id } });

  return (
    <div className="space-y-5 text-gray-700">
      <PageHeader
        title={cat.label}
        description="Category details and associated appointments"
        actions={
          <Button variant="outline" asChild size="sm">
            <Link href="/control-panel/category-management">
              <ArrowLeft className="h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        }
      />

      <div className="grid md:grid-cols-3 gap-5">
        {/* Left: Category info card */}
        <div>
          <Card className="rounded-[20px] border bg-card shadow-[0_8px_32px_rgba(245,158,11,0.12)] overflow-hidden">
            <CardHeader className="pb-2 bg-amber-50/60 border-b border-amber-100/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 border border-amber-200">
                  <Tag className="h-3.5 w-3.5 text-amber-600" />
                </span>
                Category Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Color swatch + label */}
              <div className="flex items-center gap-3">
                {cat.color && (
                  <span
                    className="h-10 w-10 rounded-xl border shrink-0 shadow-sm"
                    style={{ background: cat.color }}
                  />
                )}
                <div>
                  <p className="font-bold">{cat.label}</p>
                  {cat.icon && <p className="text-xs text-muted-foreground">{cat.icon}</p>}
                </div>
              </div>

              {cat.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
              )}

              <Separator />

              <dl className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                    <Hash className="h-2.5 w-2.5 text-muted-foreground" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">ID</dt>
                    <dd className="font-mono text-[10px] break-all">{cat.id}</dd>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                    {cat.is_active !== false ? (
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                    ) : (
                      <CircleOff className="h-2.5 w-2.5 text-gray-400" />
                    )}
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant="outline" className={`text-[10px] py-0 ${cat.is_active !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {cat.is_active !== false ? "Active" : "Inactive"}
                      </Badge>
                    </dd>
                  </div>
                </div>

                {cat.duration_minutes_default != null && (
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 border border-sky-100 shrink-0">
                      <Clock className="h-2.5 w-2.5 text-sky-500" />
                    </span>
                    <div>
                      <dt className="text-muted-foreground">Default Duration</dt>
                      <dd className="font-medium">{cat.duration_minutes_default} minutes</dd>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                    <Layers className="h-2.5 w-2.5 text-muted-foreground" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Sort Order</dt>
                    <dd className="font-medium">{cat.sort_order ?? 0}</dd>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 border shrink-0">
                    <CalendarDays className="h-2.5 w-2.5 text-muted-foreground" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd>{format(cat.created_at, "dd MMM yyyy")}</dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Right: Appointments using this category */}
        <div className="md:col-span-2">
          <Card className="rounded-[20px] border bg-card shadow-[0_4px_20px_rgba(245,158,11,0.1)] overflow-hidden">
            <CardHeader className="pb-2 bg-amber-50/60 border-b border-amber-100/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 border border-amber-200">
                  <CalendarDays className="h-3.5 w-3.5 text-amber-600" />
                </span>
                Appointments
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-bold ml-1">
                  {totalCount}
                </Badge>
                {totalCount > 15 && (
                  <span className="text-xs text-muted-foreground font-normal ml-1">(showing 15 most recent)</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {appointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No appointments use this category yet.</p>
              ) : (
                <div className="space-y-2">
                  {appointments.map((appt) => (
                    <Link
                      key={appt.id}
                      href={`/control-panel/appointments/${appt.id}`}
                      className="flex items-center justify-between rounded-lg border bg-amber-50/40 hover:bg-amber-100/50 px-3 py-2 text-xs transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{appt.title}</p>
                        <p className="text-muted-foreground">
                          Dr. {appt.owner.display_name ?? appt.owner.email} · {format(new Date(appt.start), "dd MMM yyyy, HH:mm")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] py-0 ml-2 shrink-0 ${
                          appt.status === "done"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : appt.status === "alert"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {appt.status ?? "pending"}
                      </Badge>
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
