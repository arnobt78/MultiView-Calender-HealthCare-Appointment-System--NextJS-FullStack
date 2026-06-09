"use client";

/**
 * TelehealthDashboard — inline skeleton pattern:
 *   - Static chrome (PageHeader, filter buttons, "Up Next" heading, queue section title) stays mounted.
 *   - Only the appointment data content areas (Up Next card body + queue rows) pulse as skeletons.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker on first paint.
 */

import { useAppointments } from "@/hooks/useAppointments";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Video, FileText, User, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format, isToday, isPast, isFuture } from "date-fns";
import { useAppStore } from "@/store/useAppStore";
import { useState, useMemo, useEffect } from "react";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";

export default function TelehealthDashboard() {
  const { appointments, isLoading, isError: appointmentsError } = useAppointments();
  const startVideoCall = useAppStore((state) => state.startVideoCall);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("today");

  /**
   * Mount guard: hydrate with skeleton state on first paint, then swap to real data
   * after the next animation frame — matches the PatientManagement pattern.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  const sortedAppointments = useMemo(() => {
    if (!appointments) return [];
    let filtered = [...appointments];
    if (filter === "today") {
      filtered = filtered.filter(a => isToday(new Date(a.start)));
    } else if (filter === "upcoming") {
      filtered = filtered.filter(a => isFuture(new Date(a.start)));
    }
    return filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [appointments, filter]);

  const nowStr = new Date().toISOString();
  const nextAppt = appointments
    ?.filter(a => a.status !== "done" && new Date(a.end).toISOString() > nowStr)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

  return (
    <div className={controlPanelSectionRootClass}>
      {appointmentsError ? (
        <AppSectionErrorBanner>
          Failed to load appointments. Please refresh.
        </AppSectionErrorBanner>
      ) : null}
      {/* PageHeader + filter buttons always stay static */}
      <ControlPanelPageChrome
        tab="telehealth"
        actions={
          <div className="flex rounded-2xl bg-muted p-1">
            <Button variant={filter === "today" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("today")} className="text-xs">Today</Button>
            <Button variant={filter === "upcoming" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("upcoming")} className="text-xs">Upcoming</Button>
            <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")} className="text-xs">All</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Up Next — heading always static; card body pulses while loading */}
        <div className="lg:col-span-1 border-b pb-6 lg:border-b-0 lg:border-r lg:pr-6 lg:pb-0">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary text-gray-700"></span>
            </span>
            Up Next
          </h3>

          {loading ? (
            /* Skeleton mirrors the real card layout without replacing the heading */
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
                {/* "Join Video Room" CTA — static chrome, no pulse */}
                <div className="h-12 w-full" />
              </CardContent>
            </Card>
          ) : nextAppt ? (
            <Card className="border-primary/30 shadow-md bg-gradient-to-b from-background to-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="default" className="text-xs">{format(new Date(nextAppt.start), "h:mm a")}</Badge>
                  <Badge variant="outline" className="text-xs text-gray-700">{nextAppt.category_data?.label || "Consultation"}</Badge>
                </div>
                <h4 className="text-lg font-bold mb-1 truncate" title={nextAppt.title}>{nextAppt.title}</h4>
                {nextAppt.patient_data && (
                  <div className="flex items-center gap-2 mt-4 text-sm font-medium">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {nextAppt.patient_data.firstname[0]}{nextAppt.patient_data.lastname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{nextAppt.patient_data.firstname} {nextAppt.patient_data.lastname}</span>
                  </div>
                )}
                <Separator className="my-5" />
                <div className="grid gap-2 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {Math.round((new Date(nextAppt.end).getTime() - new Date(nextAppt.start).getTime()) / 60000)} mins</span>
                  </div>
                  {nextAppt.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 " />
                      <span className="line-clamp-2" title={nextAppt.notes}>{nextAppt.notes}</span>
                    </div>
                  )}
                </div>
                <Button size="lg" className="w-full font-bold gap-2 text-md shadow-lg" onClick={() => startVideoCall(nextAppt.id)}>
                  <Video className="h-5 w-5" />
                  Join Video Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-muted/20 border rounded-2xl border-dashed">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium">No immediate appointments</p>
              <p className="text-sm text-muted-foreground mt-1">Your schedule is clear right now.</p>
            </div>
          )}
        </div>

        {/* Queue — section heading always static; rows pulse while loading */}
        <div className="lg:col-span-2">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-muted-foreground">
            <span className="p-1.5 bg-muted rounded-2xl"><Calendar className="h-4 w-4" /></span>
            {filter === "today" ? "Today's Schedule" : filter === "upcoming" ? "Upcoming Queue" : "All Appointments"}
          </h3>

          <div className="space-y-3">
            {loading ? (
              /* Skeleton rows match real row structure: time col + divider + content + action */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-4 border rounded-2xl">
                  <div className="w-20 text-center shrink-0 space-y-1">
                    <Skeleton className="h-6 w-12 mx-auto rounded" />
                    <Skeleton className="h-3 w-8 mx-auto rounded" />
                  </div>
                  <Skeleton className="h-12 w-1 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>
                  {/* Queue row actions — static chrome, no pulse */}
                  <div className="h-9 w-20 shrink-0" />
                  <div className="h-8 w-8 shrink-0 hidden sm:block" />
                </div>
              ))
            ) : sortedAppointments.length === 0 ? (
              <div className="text-center p-8 border rounded-2xl bg-background">
                <p className="text-muted-foreground">No appointments match this filter.</p>
              </div>
            ) : (
              sortedAppointments.map((appt) => {
                const isPastAppt = isPast(new Date(appt.end));
                const isCurrent = !isPastAppt && isPast(new Date(appt.start));
                return (
                  <div
                    key={appt.id}
                    className={`flex items-center gap-2 p-4 rounded-2xl border transition-all hover:shadow-sm ${isCurrent ? 'border-primary shadow-sm bg-primary/5' : isPastAppt ? 'opacity-60 bg-muted/20' : 'bg-background hover:bg-muted/10'}`}
                  >
                    <div className="w-20 text-center shrink-0">
                      <p className={`font-bold text-lg leading-tight ${isCurrent ? 'text-gray-700' : ''}`}>
                        {format(new Date(appt.start), "h:mm")}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {format(new Date(appt.start), "a")}
                      </p>
                    </div>
                    <div className={`w-1 h-12 rounded-full ${appt.status === 'done' ? 'bg-green-500' : isCurrent ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate text-base">{appt.title}</h4>
                        {isCurrent && <Badge variant="default" className="text-[10px] ml-1 h-5 px-1.5">NOW</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {appt.patient_data && (
                          <span className="flex items-center gap-1.5 truncate">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">{appt.patient_data.firstname} {appt.patient_data.lastname}</span>
                          </span>
                        )}
                        {!isToday(new Date(appt.start)) && (
                          <span className="flex items-center gap-1.5 shrink-0">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(appt.start), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {(!isPastAppt || isCurrent) ? (
                        <Button variant={isCurrent ? "default" : "secondary"} size="sm" onClick={() => startVideoCall(appt.id)} className={isCurrent ? "shadow-md" : ""}>
                          <Video className="h-4 w-4 mr-0 md:mr-2" />
                          <span className="hidden md:inline">Join</span>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>Ended</Button>
                      )}
                      <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
