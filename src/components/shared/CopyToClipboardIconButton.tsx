"use client";

import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  copied: boolean;
  onCopy: () => void;
  /** Accessible name when idle (default “Copy to clipboard”). */
  label?: string;
  className?: string;
  iconClassName?: string;
};

/** Inline Copy → Check toggle — pairs with `useCopyToClipboard`. */
export function CopyToClipboardIconButton({
  copied,
  onCopy,
  label = "Copy to clipboard",
  className,
  iconClassName = "h-3.5 w-3.5",
}: Props) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-sky-50 hover:text-sky-700",
        className
      )}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? (
        <Check className={cn(iconClassName, "text-emerald-600")} aria-hidden />
      ) : (
        <Copy className={iconClassName} aria-hidden />
      )}
    </button>
  );
}
