"use client";

import { Loader2, UserPlus, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrganizationDialogFieldLabel } from "@/components/control-panel/organization-dialog/OrganizationDialogFieldLabel";
import { OrganizationMemberPickerField } from "@/components/control-panel/organization-dialog/OrganizationMemberPickerField";
import {
  organizationDialogFooterStripClass,
  organizationDialogGlassBackButtonClass,
  organizationDialogGlassSelectTriggerClass,
  organizationDialogHeaderIconTileClass,
  organizationDialogShellClass,
} from "@/lib/organization-dialog-ui-classes";
import { indigoGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { useUsers } from "@/hooks/useUsers";
import { CP_ALL_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import type { Organization } from "@/hooks/useOrganization";

type Props = {
  org: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (args: {
    orgId: string;
    userId: string;
    role: string;
    memberLabel?: string;
  }) => void;
  isSubmitting?: boolean;
};

/** Indigo glass add-member dialog — rich user picker + role select. */
export function OrganizationAddMemberDialog({
  org,
  open,
  onOpenChange,
  onAdd,
  isSubmitting,
}: Props) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("doctor");
  const { data: usersData } = useUsers(CP_ALL_USERS_FILTERS, { enabled: open });
  const users = useMemo(() => usersData?.users ?? [], [usersData?.users]);

  function handleSubmit() {
    if (!userId) return;
    const picked = users.find((u) => u.id === userId);
    const memberLabel =
      picked?.display_name?.trim() || picked?.email?.trim() || "Member";
    onAdd({
      orgId: org.id,
      userId,
      role,
      memberLabel,
    });
    setUserId("");
    setRole("doctor");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(organizationDialogShellClass, "border-0 p-0")}>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-indigo-200/60 bg-indigo-50/40 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className={organizationDialogHeaderIconTileClass} aria-hidden>
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {toTitleCaseLabel("Add Member")}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Invite a user to {org.name} with a role.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <OrganizationMemberPickerField
              dialogOpen={open}
              value={userId}
              onValueChange={setUserId}
              disabled={isSubmitting}
            />
            <div className="space-y-1.5">
              <OrganizationDialogFieldLabel icon={UserPlus} required>
                {toTitleCaseLabel("Member Role")}
              </OrganizationDialogFieldLabel>
              <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
                <SelectTrigger className={organizationDialogGlassSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className={organizationDialogFooterStripClass}>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cn(organizationDialogGlassBackButtonClass, "rounded-full")}
                onClick={() => onOpenChange(false)}
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
