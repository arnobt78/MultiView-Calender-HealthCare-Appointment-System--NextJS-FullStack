export interface ApiError extends Error {
  statusCode: number;
  details?: unknown;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  offset: number;
  limit: number;
}
