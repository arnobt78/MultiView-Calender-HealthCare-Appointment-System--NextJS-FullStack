import { notify } from "@/lib/notify";
import { ApiError } from "@/types/api";

type FetchOptions = RequestInit & {
  // Add custom options here if needed, like a timeout
};

/**
 * A central wrapper around the built-in `fetch` API.
 * 
 * Benefits:
 * 1. Automatically parses JSON
 * 2. Standardized error throwing (ApiError)
 * 3. Easy to mock in tests
 * 4. Can easily attach auth tokens globally here if needed (though cookies handle most in Next.js)
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // `unknown` is safe here — we assert to T below only after the ok-check.
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // Endpoint returned non-JSON (rare). Fall back to empty object so error
    // extraction below still works and the generic cast to T is preserved.
    data = {};
  }

  if (!response.ok) {
    // Narrow to a plain object for safe field access without using `any`.
    const payload = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
    const message =
      (typeof payload.error === "string" ? payload.error : null) ??
      (typeof payload.message === "string" ? payload.message : null) ??
      "An unexpected error occurred";
    const error = new Error(message) as ApiError;
    error.statusCode = response.status;
    error.details = payload;
    throw error;
  }

  return data as T;
}

/**
 * Centralized error handler that automatically shows a toast notification.
 * Useful in catch blocks or onError callbacks in React Query.
 */
export function handleApiError(error: unknown, customMessage?: string) {
  console.error("API Error:", error);
  
  let errorMessage = customMessage || "Something went wrong";
  
  if (error instanceof Error) {
    errorMessage = customMessage ? `${customMessage}: ${error.message}` : error.message;
  }
  
  notify.error({
    title: "Request failed",
    subtitle: errorMessage,
  });
}
