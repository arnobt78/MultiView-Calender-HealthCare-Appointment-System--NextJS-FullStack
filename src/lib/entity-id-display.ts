/** Short prefix length for entity IDs shown in headers/tables (`#636546d1`). */
export const ENTITY_ID_SHORT_LENGTH = 8;

/** `#` + first 8 chars — display-only; copy full UUID via `EntityIdCopyInline`. */
export function formatShortEntityId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return "—";
  return `#${trimmed.slice(0, ENTITY_ID_SHORT_LENGTH)}`;
}
