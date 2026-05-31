"use client";

/**
 * InvitationList — inline skeleton pattern:
 *   - Table heading and table headers (Resource/Email, Status, Permission, Actions) stay mounted at all times.
 *   - Only the table body rows pulse as skeletons while the invitation data is loading.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flash on first paint.
 */

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import {
  useInvitations,
  type DashboardInvitation,
  type AppointmentInvitation,
} from "@/hooks/useInvitations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function isDashboardInvitation(
  inv: AppointmentInvitation | DashboardInvitation
): inv is DashboardInvitation {
  return (
    typeof inv === "object" &&
    "owner_user_id" in inv &&
    typeof (inv as DashboardInvitation).owner_user_id === "string"
  );
}

function isAppointmentInvitation(
  inv: AppointmentInvitation | DashboardInvitation
): inv is AppointmentInvitation {
  return (
    typeof inv === "object" &&
    "appointment" in inv &&
    typeof (inv as AppointmentInvitation).appointment === "string"
  );
}

export default function InvitationList({ type }: { type: "appointment" | "dashboard" }) {
  const {
    invitations,
    isLoading,
    isError: invitationsError,
    discardAppointmentInvitation,
    discardDashboardInvitation,
  } = useInvitations(type);

  /**
   * Mount guard: hydrate with skeleton state on first paint (isMounted=false → loading=true),
   * then swap to real rows after the next animation frame — prevents hydration flicker.
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  if (invitationsError) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Failed to load invitations. Please refresh.
      </div>
    );
  }

  return (
    <div>
      {/* Section heading always stays static */}
      <h3 className="font-semibold mb-2">
        Your {type === "appointment" ? "Appointment" : "Dashboard"} Invitations
      </h3>
      <Table>
        {/* Table headers always stay static */}
        <TableHeader>
          <TableRow>
            <TableHead>Resource / Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Permission</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            /* Skeleton rows — 3 placeholder rows matching real row column layout */
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-48 rounded" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                {/* Actions column — static chrome, no pulse */}
                <TableCell className="text-right">
                  <div className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : invitations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                No invitations found.
              </TableCell>
            </TableRow>
          ) : (
            invitations.map((inv) => {
              let key: string | undefined;
              let displayValue = "";
              let invitationToken: string | undefined;
              if (isAppointmentInvitation(inv)) {
                key = inv.id;
                displayValue = `${inv.appointment_title ?? "Untitled"} (${inv.appointment})`;
                invitationToken = undefined;
              } else if (isDashboardInvitation(inv)) {
                key = inv.id ?? inv.invitation_token;
                displayValue = inv.invited_email ?? inv.owner_user_id;
                invitationToken = inv.invitation_token;
              } else {
                return null;
              }
              const status = inv.status ?? "pending";
              const permission = inv.permission ?? "read";
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium">{displayValue}</TableCell>
                  <TableCell>
                    <Badge variant={status === "accepted" ? "default" : "secondary"}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{permission}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {status === "pending" && (invitationToken || (isAppointmentInvitation(inv) && key)) && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/accept-invitation?token=${invitationToken ?? key}`} target="_blank" rel="noopener noreferrer">
                          Accept
                        </a>
                      </Button>
                    )}
                    {type === "appointment" && key && (
                      <Button size="sm" variant="destructive" onClick={() => discardAppointmentInvitation(key!)}>
                        Discard
                      </Button>
                    )}
                    {type === "dashboard" && key && (
                      <Button size="sm" variant="destructive" onClick={() => discardDashboardInvitation(key!)}>
                        Discard
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
