/**
 * Utility Functions
 * 
 * This file contains shared utility functions used throughout the application.
 * The `cn` function is particularly important for conditional CSS class management.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn (className) Utility Function
 * 
 * A utility function that combines clsx and tailwind-merge for optimal class name handling.
 * 
 * Why this is useful:
 * - clsx: Conditionally joins classNames together
 * - tailwind-merge: Intelligently merges Tailwind CSS classes, resolving conflicts
 * 
 * Example usage:
 * cn("px-2 py-1", isActive && "bg-blue-500", "px-4") 
 * // Result: "py-1 bg-blue-500 px-4" (px-4 overrides px-2)
 * 
 * @param inputs - Variable number of class values (strings, objects, arrays, conditionals)
 * @returns Merged and deduplicated className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function titleCaseWordPart(part: string): string {
  if (!part) return part;
  /** Calendar file extension — keep lowercase `.ics` (avoid `ICS` → `Ics` in panel titles). */
  if (/^\.ics$/i.test(part)) return ".ics";
  return part
    .split("-")
    .map((seg) => (seg ? seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase() : seg))
    .join("-");
}

/** Title-case each `/` or `&` segment so `Client/Patient` → `Client/Patient`, not `Client/patient`. */
function titleCaseSlashAware(fragment: string): string {
  return fragment
    .split(/(\/|&)/)
    .map((piece) => (piece === "/" || piece === "&" ? piece : titleCaseWordPart(piece)))
    .join("");
}

function titleCaseLabelToken(token: string): string {
  const paren = token.match(/^(\()([^)]+)(\))$/);
  if (paren) {
    return `${paren[1]}${titleCaseSlashAware(paren[2])}${paren[3]}`;
  }
  // Whitespace split breaks `(Global For All Doctors)` into `(Global`, `For`, … — fix open/close halves.
  if (token.startsWith("(")) {
    return `(${titleCaseSlashAware(token.slice(1))}`;
  }
  if (token.endsWith(")")) {
    return `${titleCaseSlashAware(token.slice(0, -1))})`;
  }
  return titleCaseSlashAware(token);
}

/**
 * Title-case dialog chrome (labels, titles, buttons).
 * Splits on whitespace; within each token also splits on `/`, `&`, and wraps `(optional)` segments.
 */
export function toTitleCaseLabel(value: string): string {
  return value
    .split(/(\s+)/)
    .map((segment) => (/^\s+$/.test(segment) ? segment : titleCaseLabelToken(segment)))
    .join("");
}

/**
 * Subtitle / helper copy — capitalize only the first character; preserve the rest
 * (keeps "Mon–Sun", "$", "(mins)", "(%)" intact).
 */
export function toSentenceCaseSubtitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
