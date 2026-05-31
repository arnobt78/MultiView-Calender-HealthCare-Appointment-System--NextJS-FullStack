"use client";

import { Sparkles } from "lucide-react";
import { appSectionDemoNoteBannerClass } from "@/lib/section-page-layout";
import type { DemoShowcaseNoteCopy } from "@/lib/demo-showcase-copy";
import { cn } from "@/lib/utils";

type DemoShowcaseFeatureNoteProps = {
  note: DemoShowcaseNoteCopy;
  className?: string;
};

/** Intentional demo limitation banner — list/detail chrome; always mounted (no skeleton). */
export function DemoShowcaseFeatureNote({ note, className }: DemoShowcaseFeatureNoteProps) {
  return (
    <div className={cn(appSectionDemoNoteBannerClass, className)} role="note">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-200/70 bg-emerald-100/80 text-emerald-700">
        <Sparkles className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold leading-snug">{note.title}</p>
        <p className="text-sm leading-relaxed text-emerald-900/90">{note.body}</p>
      </div>
    </div>
  );
}
