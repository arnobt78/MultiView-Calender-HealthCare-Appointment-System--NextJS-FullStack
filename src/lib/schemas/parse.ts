import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function firstZodIssue(error: ZodError) {
  return error.issues[0]?.message || "Invalid request payload";
}

export function zodBadRequest(error: ZodError) {
  return NextResponse.json(
    {
      error: firstZodIssue(error),
      details: error.flatten(),
    },
    { status: 400 }
  );
}
