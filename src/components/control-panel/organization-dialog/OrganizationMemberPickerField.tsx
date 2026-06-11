"use client";

import { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrganizationDialogPickerSearchInput } from "@/components/control-panel/organization-dialog/OrganizationDialogPickerSearchInput";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import { useUsers } from "@/hooks/useUsers";
import {
  CP_ADMIN_USERS_FILTERS,
  CP_ALL_USERS_FILTERS,
  CP_DOCTOR_USERS_FILTERS,
  CP_PATIENT_USERS_FILTERS,
} from "@/lib/control-panel-users-filters";
import { organizationDialogPickerScrollClass } from "@/lib/organization-dialog-ui-classes";
import type { OrgMemberRole } from "@/lib/organization-member-role";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
} from "@/lib/table-display-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import type { User } from "@/types/types";

type Props = {
  dialogOpen: boolean;
  value: string;
  onValueChange: (userId: string) => void;
  /** Filter users by platform role for create-org role slots. */
  roleFilter?: OrgMemberRole;
  /** Skip users already in org or picked in sibling slots. */
  excludeUserIds?: string[];
  /** Fires after pick — parent can auto-fill org member role from user.role. */
  onUserPicked?: (user: User) => void;
  disabled?: boolean;
  /** Show clear on collapsed selection — for optional create-org slots. */
  clearable?: boolean;
  label?: string;
  placeholder?: string;
};

function usersFilterForRole(roleFilter?: OrgMemberRole) {
  if (roleFilter === "admin") return CP_ADMIN_USERS_FILTERS;
  if (roleFilter === "doctor") return CP_DOCTOR_USERS_FILTERS;
  if (roleFilter === "patient") return CP_PATIENT_USERS_FILTERS;
  return CP_ALL_USERS_FILTERS;
}

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
      <UserRoleBadge role={user.role} className="shrink-0" />
    </div>
  );
}

/** Rich user picker — avatar, email, UserRoleBadge; optional role filter + search. */
export function OrganizationMemberPickerField({
  dialogOpen,
  value,
  onValueChange,
  roleFilter,
  excludeUserIds = [],
  onUserPicked,
  disabled,
  clearable = false,
  label = toTitleCaseLabel("Select User"),
  placeholder = toTitleCaseLabel("Choose a user"),
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filters = usersFilterForRole(roleFilter);
  const { data, isLoading } = useUsers(filters, { enabled: dialogOpen });
  const excludeSet = useMemo(() => new Set(excludeUserIds), [excludeUserIds]);

  const users = useMemo(() => {
    const rows = data?.users ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((user) => {
      if (excludeSet.has(user.id)) return false;
      if (!q) return true;
      const name = user.display_name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      return name.includes(q) || email.includes(q);
    });
  }, [data?.users, excludeSet, search]);

  const selected = value ? (data?.users ?? []).find((u) => u.id === value) : undefined;

  return (
    <StaffAppointmentPickerField
      tone="indigo"
      icon={UserRound}
      label={label}
      placeholder={placeholder}
      triggerValue={
        selected
          ? selected.display_name?.trim() || selected.email?.trim() || "User"
          : placeholder
      }
      selectedContent={
        selected ? <UserPickerCard user={selected} selected /> : undefined
      }
      changeLabel={toTitleCaseLabel("Change user")}
      clearable={clearable}
      clearLabel={toTitleCaseLabel("Clear")}
      onClear={
        clearable && value
          ? () => {
              onValueChange("");
              setSearch("");
            }
          : undefined
      }
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      disabled={disabled}
    >
      {/* StaffAppointmentPickerField already wraps open state in organizationDialogDropdownPanelClass */}
      <div className="mb-2">
        <OrganizationDialogPickerSearchInput
          value={search}
          onChange={setSearch}
          placeholder={toTitleCaseLabel("Search by name or email")}
          ariaLabel="Search users"
        />
      </div>
      <div className={organizationDialogPickerScrollClass}>
        {isLoading ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">No users match.</p>
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
                    onUserPicked?.(user);
                    setPickerOpen(false);
                    setSearch("");
                  }}
                >
                  <UserPickerCard user={user} selected={user.id === value} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StaffAppointmentPickerField>
  );
}
