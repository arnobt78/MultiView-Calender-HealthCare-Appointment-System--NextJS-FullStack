"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <FieldError>{error}</FieldError> : hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

export function FieldHint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs text-gray-500", className)}>{children}</p>;
}

export function FieldError({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-xs font-medium text-rose-600", className)}>{children}</p>;
}

export function withInvalidProps(error?: string | null) {
  return error
    ? ({ "aria-invalid": true, "aria-describedby": "field-error" } as const)
    : ({ "aria-invalid": false } as const);
}
