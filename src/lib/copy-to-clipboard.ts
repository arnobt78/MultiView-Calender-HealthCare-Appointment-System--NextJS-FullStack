/**
 * Writes text to the system clipboard — returns false when denied or unavailable.
 * Used by `useCopyToClipboard`; kept as a pure helper for unit tests in Node.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = text.trim();
  if (!value) return false;
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return false;
    }
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
