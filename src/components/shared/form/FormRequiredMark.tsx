import { formRequiredMarkClass } from "@/lib/form-field-label-classes";
import { cn } from "@/lib/utils";

type Props = {
  /** Doctor settings labels use `text-sm` beside `text-xs` copy. */
  className?: string;
};

/** Shared mandatory field asterisk — appointment, patient, booking, and doctor-settings dialogs. */
export function FormRequiredMark({ className }: Props) {
  return (
    <span className={cn(formRequiredMarkClass, className)} aria-hidden>
      {" *"}
    </span>
  );
}
