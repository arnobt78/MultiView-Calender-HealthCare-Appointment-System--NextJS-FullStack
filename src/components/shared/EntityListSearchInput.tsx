"use client";

import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Shared control-panel entity list search — matches patient-management toolbar rhythm. */
export const entityListSearchInputClass =
  "h-10 w-full min-w-0 rounded-2xl border-gray-200 bg-white pl-8 pr-2 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-slate-400 focus:ring-slate-200";

type EntityListSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
};

export function EntityListSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: EntityListSearchInputProps) {
  return (
    <div className={cn("relative min-w-0 w-full flex-1 sm:max-w-md sm:flex-1", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <FiSearch className="h-4 w-4" aria-hidden />
      </span>
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={entityListSearchInputClass}
      />
    </div>
  );
}
