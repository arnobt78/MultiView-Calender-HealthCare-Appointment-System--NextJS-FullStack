"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
    discardAppointmentInvitation,
    discardDashboardInvitation,
  } = useInvitations(type);

  if (isLoading) return <div className="text-muted-foreground">Loading invitations...</div>;
  if (!invitations.length)
    return (
      <p className="mt-4 text-muted-foreground">No invitations found.</p>
    );

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">
        Your {type === "appointment" ? "Appointment" : "Dashboard"} Invitations
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource / Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Permission</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((inv) => {
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
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <a
                        href={`/accept-invitation?token=${invitationToken ?? key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Accept
                      </a>
                    </Button>
                  )}
                  {type === "appointment" && key && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => discardAppointmentInvitation(key!)}
                    >
                      Discard
                    </Button>
                  )}
                  {type === "dashboard" && key && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => discardDashboardInvitation(key!)}
                    >
                      Discard
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
