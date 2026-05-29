/** Shared em-dash for empty clinical fields (tables + patient schema). */
export const CLINICAL_EMPTY_EM_DASH = "—" as const;

/** True when a string field should render real content (not empty placeholder). */
export function clinicalHasTextValue(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/** True when a list field has at least one entry. */
export function clinicalHasListValue(value: readonly unknown[] | null | undefined): boolean {
  return Array.isArray(value) && value.length > 0;
}
