/**
 * Zod error helpers for API route responses.
 *
 * Uses Zod v4 APIs:
 *  - `z.flattenError(err)` instead of the deprecated `err.flatten()`
 *    (gives the same { formErrors, fieldErrors } shape).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import type { ZodError } from "zod";

/** Returns the first human-readable validation issue message. */
export function firstZodIssue(error: ZodError) {
  return error.issues[0]?.message ?? "Invalid request payload";
}

/**
 * Returns a 400 JSON response with the first issue message and a full
 * flattened error map that clients can use for per-field highlighting.
 */
export function zodBadRequest(error: ZodError) {
  return NextResponse.json(
    {
      error: firstZodIssue(error),
      // z.flattenError is the Zod v4 replacement for the deprecated err.flatten()
      details: z.flattenError(error),
    },
    { status: 400 }
  );
}
