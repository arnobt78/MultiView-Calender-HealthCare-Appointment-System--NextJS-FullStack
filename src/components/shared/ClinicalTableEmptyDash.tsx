import { cn } from "@/lib/utils";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";

/** Centers em-dash placeholder in fixed-width clinical / snapshot table cells. */
export const clinicalTableEmptyCellClass = cn(
  clinicalTableCellMinRowClass,
  "flex w-full items-center justify-center text-center"
);

export function ClinicalTableEmptyDash() {
  return (
    <div className={clinicalTableEmptyCellClass}>
      <span className={clinicalCellMutedTextClass}>—</span>
    </div>
  );
}
