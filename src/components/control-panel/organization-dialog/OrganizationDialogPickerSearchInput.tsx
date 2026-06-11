"use client";

import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { organizationDialogSearchInputClass } from "@/lib/organization-dialog-ui-classes";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
};

/** Indigo picker search row — visible leading icon beside placeholder text. */
export function OrganizationDialogPickerSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: Props) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-indigo-500/85">
        <FiSearch className="h-4 w-4" aria-hidden />
      </span>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={organizationDialogSearchInputClass}
      />
    </div>
  );
}
