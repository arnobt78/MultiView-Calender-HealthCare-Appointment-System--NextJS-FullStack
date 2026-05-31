"use client";

import type { CpDevStubCopy } from "@/lib/cp-dev-stub-copy";
import { cn } from "@/lib/utils";

type CpDevStubSubmitNoteProps = {
  stub: CpDevStubCopy;
  className?: string;
};

/** Muted implementer hint — pair with disabled submit on CP demo stubs. */
export function CpDevStubSubmitNote({ stub, className }: CpDevStubSubmitNoteProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-slate-300/80 bg-slate-50/80 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className
      )}
      role="note"
    >
      <p className="font-medium text-slate-700">Demo stub — submit disabled</p>
      <p className="mt-1">{stub.note}</p>
      <p className="mt-1 font-mono text-[10px] text-slate-600">{stub.apiHint}</p>
    </div>
  );
}
