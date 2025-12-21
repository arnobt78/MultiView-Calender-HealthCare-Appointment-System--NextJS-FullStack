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
