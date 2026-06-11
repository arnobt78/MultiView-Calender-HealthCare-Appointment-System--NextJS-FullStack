"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "@/components/shared/UserRoleBadge";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import {
  ORG_MEMBER_ROLE_OPTIONS,
  type OrgMemberRole,
} from "@/lib/organization-member-role";
import { clinicalCellMutedTextClass, clinicalCellPrimaryTextClass } from "@/lib/table-display-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  value: OrgMemberRole;
  onValueChange: (role: OrgMemberRole) => void;
  disabled?: boolean;
};

function RolePickerCard({
  role,
  description,
  selected,
}: {
  role: OrgMemberRole;
  description: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 rounded-xl border px-3 py-2 text-left",
        selected
          ? "border-indigo-400/70 bg-indigo-50/80 ring-1 ring-indigo-300/50"
          : "border-indigo-200/50 bg-white/80 hover:bg-indigo-50/40"
      )}
    >
      <UserRoleBadge role={role} className="shrink-0" />
      <p className={cn(clinicalCellMutedTextClass, "min-w-0 flex-1 pt-0.5")}>
        {description}
      </p>
    </div>
  );
}

/** Rich org member role picker — badge + helper text rows (indigo glass). */
export function OrganizationMemberRolePickerField({
  value,
  onValueChange,
  disabled,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const selectedOption = ORG_MEMBER_ROLE_OPTIONS.find((o) => o.value === value);

  return (
    <StaffAppointmentPickerField
      tone="indigo"
      icon={UserCog}
      label={toTitleCaseLabel("Member Role")}
      placeholder={toTitleCaseLabel("Select member role")}
      triggerValue={
        selectedOption ? (
          <span className={clinicalCellPrimaryTextClass}>{selectedOption.label}</span>
        ) : undefined
      }
      selectedContent={
        selectedOption ? (
          <RolePickerCard
            role={selectedOption.value}
            description={selectedOption.description}
            selected
          />
        ) : undefined
      }
      changeLabel={toTitleCaseLabel("Change role")}
      open={pickerOpen}
      onOpenChange={setPickerOpen}
      disabled={disabled}
    >
      <ul className="space-y-2">
            {ORG_MEMBER_ROLE_OPTIONS.map((option) => (
              <li key={option.value}>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto w-full justify-start rounded-xl p-0 hover:bg-transparent"
                  onClick={() => {
                    onValueChange(option.value);
                    setPickerOpen(false);
                  }}
                >
                  <RolePickerCard
                    role={option.value}
                    description={option.description}
                    selected={option.value === value}
                  />
                </Button>
              </li>
            ))}
      </ul>
    </StaffAppointmentPickerField>
  );
}
