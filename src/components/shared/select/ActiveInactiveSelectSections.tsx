"use client";

import type { ReactNode } from "react";
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const INACTIVE_SECTION_LABEL = "Inactive — not available for new appointments";

type ActiveInactiveSelectSectionsProps<T> = {
  selectable: T[];
  inactiveDisplay: T[];
  getItemKey: (item: T) => string;
  getTextValue?: (item: T) => string;
  renderSelectableItem: (item: T) => ReactNode;
  renderInactiveItem: (item: T) => ReactNode;
  selectableItemClassName?: string;
  inactiveSectionLabel?: string;
};

/**
 * Booking dropdown body: active rows selectable; inactive rows disabled below a separator.
 * Used by appointment create/edit — lists elsewhere still show all entities.
 */
export function ActiveInactiveSelectSections<T>({
  selectable,
  inactiveDisplay,
  getItemKey,
  getTextValue,
  renderSelectableItem,
  renderInactiveItem,
  selectableItemClassName,
  inactiveSectionLabel = INACTIVE_SECTION_LABEL,
}: ActiveInactiveSelectSectionsProps<T>) {
  return (
    <>
      {selectable.map((item) => {
        const key = getItemKey(item);
        return (
          <SelectItem
            key={key}
            value={key}
            textValue={getTextValue?.(item)}
            className={selectableItemClassName}
          >
            {renderSelectableItem(item)}
          </SelectItem>
        );
      })}
      {inactiveDisplay.length > 0 ? (
        <>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">
              {inactiveSectionLabel}
            </SelectLabel>
            {inactiveDisplay.map((item) => {
              const key = getItemKey(item);
              return (
                <SelectItem
                  key={`inactive-${key}`}
                  value={key}
                  textValue={getTextValue?.(item)}
                  disabled
                  className={cn("cursor-not-allowed opacity-60")}
                >
                  {renderInactiveItem(item)}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </>
      ) : null}
    </>
  );
}
