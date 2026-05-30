"use client";

import type { ReactNode } from "react";
import { CLINICAL_EMPTY_EM_DASH, clinicalHasTextValue } from "@/lib/clinical-empty-value";
import { cn } from "@/lib/utils";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";

/**
 * `table` — snapshot / list TanStack cells: left-aligned muted em-dash (same rhythm as cell text).
 * `definition` — patient schema `<dd>` value column (centered).
 * `inline` — em-dash inside flowing text (audit timestamps).
 */
export type ClinicalEmptyLayout = "table" | "definition" | "inline";

export function clinicalEmptyShellClass(layout: ClinicalEmptyLayout): string {
  switch (layout) {
    case "table":
      return cn(
        clinicalTableCellMinRowClass,
        "flex w-full min-w-0 items-center justify-start text-left"
      );
    case "definition":
      return "flex w-full min-h-[1.25rem] items-center justify-center text-center";
    case "inline":
      return "inline-flex min-w-[1.25rem] items-center justify-center align-middle text-center";
  }
}

/** Empty clinical value — `table` uses start-aligned muted em-dash; definition/inline stay centered. */
export function ClinicalEmptyDash({ layout = "table" }: { layout?: ClinicalEmptyLayout }) {
  return (
    <span className={clinicalEmptyShellClass(layout)} role="presentation">
      <span className={clinicalCellMutedTextClass}>{CLINICAL_EMPTY_EM_DASH}</span>
    </span>
  );
}

/** @deprecated Use `ClinicalEmptyDash` — kept for existing snapshot column imports. */
export const ClinicalTableEmptyDash = () => <ClinicalEmptyDash layout="table" />;

export const clinicalTableEmptyCellClass = clinicalEmptyShellClass("table");

/** String field → trimmed text or empty placeholder (`layout` defaults to schema definition rows). */
export function clinicalEmptyOr(
  value: string | null | undefined,
  layout: ClinicalEmptyLayout = "definition"
): ReactNode {
  if (!clinicalHasTextValue(value)) {
    return <ClinicalEmptyDash layout={layout} />;
  }
  return value!.trim();
}

/** Arbitrary content when `hasValue`; otherwise empty placeholder (tables, schema, audit).
 *  Pass `() => node` when content reads nullable fields — JSX args evaluate before the guard runs. */
export function clinicalEmptyOrNode(
  hasValue: boolean,
  content: ReactNode | (() => ReactNode),
  layout: ClinicalEmptyLayout = "definition"
): ReactNode {
  if (!hasValue) {
    return <ClinicalEmptyDash layout={layout} />;
  }
  return typeof content === "function" ? content() : content;
}
