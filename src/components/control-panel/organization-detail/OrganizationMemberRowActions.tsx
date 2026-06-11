"use client";

import { useState } from "react";
import { EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import {
  doctorDetailHref,
  patientDetailHref,
  userDetailHref,
  type EntityRole,
} from "@/lib/entity-routes";

function resolveMemberViewHref(
  member: OrganizationDetailMemberRow,
  viewerRole: EntityRole
): string | null {
  if (member.role === "patient" && member.patient_id) {
    return patientDetailHref(viewerRole, member.patient_id);
  }
  if (member.role === "doctor") {
    return doctorDetailHref(viewerRole, member.user_id);
  }
  return userDetailHref(viewerRole, member.user_id);
}

/** Org detail members ⋮ menu — view profile + remove (owner only). */
export function OrganizationMemberRowActions({
  member,
  orgName,
  viewerRole,
  canManage,
  onRemoveMember,
}: {
  member: OrganizationDetailMemberRow;
  orgName: string;
  viewerRole: EntityRole;
  canManage: boolean;
  onRemoveMember: (member: OrganizationDetailMemberRow) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const viewHref = resolveMemberViewHref(member, viewerRole);
  const memberLabel = member.display_name ?? member.email ?? "Member";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" type="button" className="h-7 w-7">
            <EllipsisVertical className="h-4 w-4" aria-hidden />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {viewHref ? (
            <DropdownMenuItem asChild>
              <PrefetchingLink
                href={viewHref}
                className="flex cursor-pointer items-center gap-2"
              >
                <Eye className="h-4 w-4" aria-hidden />
                View
              </PrefetchingLink>
            </DropdownMenuItem>
          ) : null}
          {canManage ? (
            <>
              {viewHref ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 text-red-600 focus:text-red-600"
                onSelect={(e) => {
                  e.preventDefault();
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Remove
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {canManage ? (
        <ConfirmActionDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          variant="destructive"
          title="Remove Member"
          subtitle={`Remove ${memberLabel} from ${orgName}?`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={() => {
            onRemoveMember(member);
            setConfirmOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
