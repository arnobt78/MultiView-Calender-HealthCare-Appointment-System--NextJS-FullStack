"use client";

import { CopyToClipboardIconButton } from "@/components/shared/CopyToClipboardIconButton";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

type Props = {
  /** Full UUID copied to clipboard. */
  value: string;
  /** Visible label — defaults to full `value`. */
  displayValue?: string;
  /** When true (default), render mono/break-all styling for UUID rows. */
  monospace?: boolean;
  className?: string;
  textClassName?: string;
  copyLabel?: string;
};

/**
 * Responsive inline entity ID + clipboard icon.
 * Copies the full `value` even when showing a short `#xxxxxxxx` label.
 */
export function EntityIdCopyInline({
  value,
  displayValue,
  monospace = true,
  className,
  textClassName,
  copyLabel = "Copy ID",
}: Props) {
  const { copied, copy } = useCopyToClipboard();
  const trimmed = value?.trim() ?? "";
  const shown = displayValue ?? trimmed;

  if (!trimmed) {
    return <span className={cn("text-muted-foreground", textClassName)}>—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 flex-wrap items-center gap-1",
        className
      )}
    >
      <span
        className={cn(
          monospace && "break-all font-mono text-xs text-muted-foreground",
          textClassName
        )}
        title={trimmed}
      >
        {shown}
      </span>
      <CopyToClipboardIconButton
        copied={copied}
        onCopy={() => void copy(trimmed)}
        label={copyLabel}
      />
    </span>
  );
}
