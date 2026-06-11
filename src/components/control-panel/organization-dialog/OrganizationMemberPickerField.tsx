"use client";

import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import { useUsers } from "@/hooks/useUsers";
import { CP_ALL_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { organizationDialogDropdownPanelClass } from "@/lib/organization-dialog-ui-classes";
import { bookingPickerScrollClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import { clinicalCellMutedTextClass, clinicalCellPrimaryTextClass } from "@/lib/table-display-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import type { User } from "@/types/types";

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  doctor: "bg-blue-100 text-blue-700",
  patient: "bg-green-100 text-green-700",
};

type Props = {
  dialogOpen: boolean;
  value: string;
  onValueChange: (userId: string) => void;
  disabled?: boolean;
};

function UserPickerCard({ user, selected }: { user: User; selected?: boolean }) {
  const label = user.display_name?.trim() || user.email?.trim() || "User";
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left",
        selected
          ? "border-indigo-400/70 bg-indigo-50/80 ring-1 ring-indigo-300/50"
          : "border-indigo-200/50 bg-white/80 hover:bg-indigo-50/40"
      )}
    >
      <UserAvatar alt={label} src={user.image} fallbackText={label} sizeClassName="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <p className={clinicalCellPrimaryTextClass}>{label}</p>
        {user.email ? <p className={clinicalCellMutedTextClass}>{user.email}</p> : null}
      </div>
      {user.role ? (
        <Badge className={ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-700"}>
          {user.role}
        </Badge>
      ) : null}
    </div>
  );
}

/** Rich user picker — avatar, email, role badge (appointment picker height pattern). */
export function OrganizationMemberPickerField({
  dialogOpen,
  value,
  onValueChange,
  disabled,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data, isLoading } = useUsers(CP_ALL_USERS_FILTERS, { enabled: dialogOpen });
  const users = useMemo(() => data?.users ?? [], [data?.users]);
  const selected = value ? users.find((u) => u.id === value) : undefined;

  return (
    <StaffAppointmentPickerField
      tone="sky"
      icon={UserRound}
      label={toTitleCaseLabel("Select User")}
      placeholder={toTitleCaseLabel("Choose a user")}
      triggerValue={
        selected
          ? selected.display_name?.trim() || selected.email?.trim() || "User"
          : toTitleCaseLabel("Choose a user")
      }
      selectedContent={
        selected ? <UserPickerCard user={selected} selected /> : undefined
      }
      changeLabel={toTitleCaseLabel("Change user")}
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      disabled={disabled}
    >
      <div className={organizationDialogDropdownPanelClass}>
        <div className={bookingPickerScrollClass}>
          {isLoading ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">Loading users…</p>
          ) : users.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">No users found.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start rounded-xl p-0 hover:bg-transparent"
                    onClick={() => {
                      onValueChange(user.id);
                      setPickerOpen(false);
                    }}
                  >
                    <UserPickerCard user={user} selected={user.id === value} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </StaffAppointmentPickerField>
  );
}
