"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORY_ICON_OPTIONS,
  categoryIconOptionLabel,
  normalizeCategoryIcon,
  type CategoryIconName,
} from "@/lib/category-icon-options";
import { categoryDialogGlassSelectTriggerClass } from "@/lib/category-dialog-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  value: string | null | undefined;
  onValueChange: (icon: CategoryIconName) => void;
  triggerClassName?: string;
  disabled?: boolean;
};

/** Category dialog icon field — visual Lucide rows instead of free-text Lucide names. */
export function CategoryIconPickerSelect({
  value,
  onValueChange,
  triggerClassName,
  disabled = false,
}: Props) {
  const normalized = normalizeCategoryIcon(value);
  const SelectedIcon = CATEGORY_ICON_OPTIONS.find((o) => o.value === normalized)?.Icon;

  return (
    <Select
      value={normalized}
      onValueChange={(v) => onValueChange(v as CategoryIconName)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(categoryDialogGlassSelectTriggerClass, triggerClassName)}
        aria-label="Category icon"
      >
        {SelectedIcon ? (
          <SelectedIcon className="mr-2 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
        ) : null}
        <SelectValue>{toTitleCaseLabel(categoryIconOptionLabel(normalized))}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {CATEGORY_ICON_OPTIONS.map(({ value: iconValue, label, Icon }) => (
          <SelectItem key={iconValue} value={iconValue}>
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
              <span>{toTitleCaseLabel(label)}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
