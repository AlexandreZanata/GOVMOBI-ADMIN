/**
 * Structured API error thrown by facade methods.
 */
export class ApiError extends Error {
  /** HTTP status code returned by backend. */
  status: number;
  /** Machine-readable backend error code when available. */
  code: string;

  /**
   * Creates a typed API error.
   *
   * @param status - HTTP status code
   * @param code - Backend error code
   * @param message - Human-readable error message
   */
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Standardized API error payload shape returned by backend services.
 */
export interface ApiErrorPayload {
  /** Machine-readable error identifier. */
  code?: string;
  /** Human-readable description for UI and logs. */
  message?: string;
}
