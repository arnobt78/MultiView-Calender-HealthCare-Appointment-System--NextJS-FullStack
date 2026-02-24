import { toast } from "sonner";
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

  let data: any;
  try {
    data = await response.json();
  } catch (err) {
    data = {}; // Some endpoints might return non-JSON on success, but usually we expect JSON
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || "An unexpected error occurred") as ApiError;
    error.statusCode = response.status;
    error.details = data;
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
  
  toast.error(errorMessage);
}
