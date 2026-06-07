"use client";

import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import type { FullAppointment } from "@/hooks/useAppointments";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail, Phone, Calendar, Clock, Video, FileText,
  Activity, User, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useAppStore } from "@/store/useAppStore";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";

export default function PatientDetailView({ patientId }: { patientId: string }) {
  const { patients, isLoading: patientsLoading, isError: patientsError } = usePatients();
  const { appointments, isLoading: apptsLoading, isError: apptsError } = useAppointments();
  const startVideoCall = useAppStore((state) => state.startVideoCall);

  const patient = patients.find((p) => p.id === patientId);
  const patientAppts = appointments?.filter((a) => a.patient === patientId) || [];

  if (patientsLoading || apptsLoading) return <PatientDetailSkeleton />;

  if (patientsError || apptsError) {
    return (
      <AppSectionErrorBanner>
        Failed to load patient data. Please refresh.
      </AppSectionErrorBanner>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p>Patient not found or you don&apos;t have access.</p>
      </div>
    );
  }

  const upcomingAppts = patientAppts.filter((a: FullAppointment) => new Date(a.start) > new Date());

  const initials = `${patient.firstname[0]}${patient.lastname[0]}`.toUpperCase();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* LEFT COLUMN: Profile & Contact (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="shadow-sm border-muted">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-sm">
                <AvatarFallback className="text-2xl bg-primary/10 text-gray-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold tracking-tight">
                {patient.firstname} {patient.lastname}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={patient.active ? "default" : "secondary"}>
                  {patient.active ? "Active" : "Inactive"}
                </Badge>
                {patient.care_level && (
                  <Badge variant="outline">Care level {patient.care_level}</Badge>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground " />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground truncate" title={patient.email || "N/A"}>
                    {patient.email || "No email on file"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground " />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">
                    {patient.phone?.trim() ? patient.phone : "—"}
                  </p>
                </div>
              </div>
              {patient.birth_date && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground " />
                  <div>
                    <p className="font-medium">Date of Birth</p>
                    <p className="text-muted-foreground">
                      {format(new Date(patient.birth_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CENTER COLUMN: Timeline / Activity Feed (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="shadow-sm border-muted h-full flex flex-col">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-700" />
                  Patient Timeline
                </CardTitle>
                <CardDescription>History of appointments and notes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto pt-6">
            {patientAppts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>No activity history yet.</p>
              </div>
            ) : (
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {patientAppts.sort((a: FullAppointment, b: FullAppointment) => new Date(b.start).getTime() - new Date(a.start).getTime()).map((appt: FullAppointment) => {
                  const isUpcoming = new Date(appt.start) > new Date();
                  return (
                    <div key={appt.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Timeline Dot */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm ${isUpcoming ? 'bg-primary text-gray-700-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {isUpcoming ? <Calendar className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>

                      {/* Content Card */}
                      <Card className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow ${isUpcoming ? 'border-primary/20 bg-primary/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {format(new Date(appt.start), "MMM d, yyyy")}
                            </span>
                            <Badge variant={appt.status === "done" ? "default" : appt.status === "pending" ? "secondary" : "outline"} className="text-[10px]">
                              {appt.status || "Scheduled"}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm mb-1">{appt.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Clock className="h-3 w-3" />
                            {format(new Date(appt.start), "h:mm a")} - {format(new Date(appt.end), "h:mm a")}
                          </div>
                          {appt.notes && (
                            <div className="text-sm bg-background p-2 rounded-2xl border text-muted-foreground mt-2 inline-flex items-start gap-2 w-full">
                              <FileText className="h-3.5 w-3.5  shrink-0" />
                              <p className="line-clamp-2">{appt.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Upcoming & Quick Actions (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="shadow-sm border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppts.map((appt: FullAppointment) => (
                  <div key={appt.id} className="p-3 bg-muted/40 rounded-2xl border text-sm">
                    <p className="font-medium mb-1 truncate">{appt.title}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(appt.start), "MMM d, h:mm a")}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="w-full text-xs h-8" variant="default">
                        Details
                      </Button>
                      <Button
                        size="sm"
                        className="w-full text-xs h-8 gap-1.5"
                        variant="secondary"
                        onClick={() => startVideoCall(appt.id)}
                      >
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-700">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Calendar className="h-4 w-4" /> Book Appointment
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <FileText className="h-4 w-4" /> Add Clinical Note
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline">
              <Mail className="h-4 w-4" /> Send Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PatientDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in duration-500">
      {/* Left Col */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
            <Separator className="my-6 w-full" />
            <div className="w-full space-y-2">
              {/* CTA buttons — static chrome, no pulse */}
              <div className="h-10 w-full" />
              <div className="h-10 w-full" />
              <div className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Col */}
      <div className="lg:col-span-6">
        <Card className="h-full">
          <CardHeader className="border-b">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8 relative before:absolute before:inset-0 before:mx-auto before:h-full before:w-0.5 before:bg-muted">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="relative flex justify-center group">
                  <Skeleton className="w-10 h-10 rounded-full z-10 shrink-0" />
                  <Card className={`absolute w-[calc(50%-2.5rem)] ${i % 2 === 0 ? 'right-0' : 'left-0'} p-4`}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-16 w-full" />
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Col */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
