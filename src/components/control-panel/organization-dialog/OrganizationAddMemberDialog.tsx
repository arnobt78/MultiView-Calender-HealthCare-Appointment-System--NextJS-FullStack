"use client";

import { Loader2, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrganizationDialogHeader } from "@/components/control-panel/organization-dialog/OrganizationDialogHeader";
import { OrganizationMemberPickerField } from "@/components/control-panel/organization-dialog/OrganizationMemberPickerField";
import { OrganizationMemberRolePickerField } from "@/components/control-panel/organization-dialog/OrganizationMemberRolePickerField";
import {
  organizationDialogFooterStripClass,
  organizationDialogGlassBackButtonClass,
  organizationDialogShellClass,
} from "@/lib/organization-dialog-ui-classes";
import {
  mapUserRoleToOrgMemberRole,
  type OrgMemberRole,
} from "@/lib/organization-member-role";
import { indigoGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import type { Organization } from "@/hooks/useOrganization";

type Props = {
  org: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing org members — excluded from user picker. */
  existingMemberUserIds?: string[];
  onAdd: (args: {
    orgId: string;
    userId: string;
    role: string;
    memberLabel?: string;
  }) => void;
  isSubmitting?: boolean;
};

/** Indigo glass add-member — rich pickers; role auto-fills from selected user.role. */
export function OrganizationAddMemberDialog({
  org,
  open,
  onOpenChange,
  existingMemberUserIds = [],
  onAdd,
  isSubmitting,
}: Props) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<OrgMemberRole>("doctor");

  function handleOpenChange(next: boolean) {
    if (!next) {
      setUserId("");
      setRole("doctor");
    }
    onOpenChange(next);
  }

  function handleSubmit() {
    if (!userId) return;
    onAdd({
      orgId: org.id,
      userId,
      role,
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(organizationDialogShellClass, "border-0 p-0")}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <OrganizationDialogHeader
            icon={Users}
            title={toTitleCaseLabel("Add Member")}
            description={`Invite a user to ${org.name} with a role.`}
          />

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <OrganizationMemberPickerField
              key={`add-member-picker-${open}`}
              dialogOpen={open}
              value={userId}
              onValueChange={setUserId}
              excludeUserIds={existingMemberUserIds}
              onUserPicked={(user) => setRole(mapUserRoleToOrgMemberRole(user.role))}
              disabled={isSubmitting}
            />
            <OrganizationMemberRolePickerField
              value={role}
              onValueChange={setRole}
              disabled={isSubmitting}
            />
          </div>

          <div className={organizationDialogFooterStripClass}>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cn(organizationDialogGlassBackButtonClass, "rounded-full")}
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="size-4 shrink-0" aria-hidden />
                {toTitleCaseLabel("Cancel")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  indigoGlassPrimaryButtonClass,
                  "rounded-full disabled:pointer-events-none disabled:opacity-50"
                )}
                onClick={handleSubmit}
                disabled={!userId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    {toTitleCaseLabel("Adding…")}
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 shrink-0" aria-hidden />
                    {toTitleCaseLabel("Add Member")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
