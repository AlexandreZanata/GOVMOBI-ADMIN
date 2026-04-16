/**
 * Filter parameters for listing users.
 */
export interface ListUsersInput {
  /** Filter by role. */
  role?: "ADMIN" | "SUPERVISOR" | "DISPATCHER" | "FIELD_AGENT" | "AGENT";
  /** Filter by department identifier. */
  departmentId?: string;
  /** Filter by account status. */
  status?: "active" | "inactive";
  /** Page number (default: 1). */
  page?: number;
  /** Items per page (default: 25, max: 100). */
  pageSize?: number;
}

/**
 * Input contract for creating a new user.
 */
export interface CreateUserInput {
  /** Full display name. */
  name: string;
  /** Unique email address. */
  email: string;
  /** Role that defines permission scope. */
  role: "ADMIN" | "SUPERVISOR" | "DISPATCHER" | "FIELD_AGENT" | "AGENT";
  /** Department the user belongs to. */
  departmentId: string;
}

/**
 * Input contract for updating an existing user (partial PATCH).
 */
export interface UpdateUserInput {
  /** Updated display name. */
  name?: string;
  /** Updated role. */
  role?: "ADMIN" | "SUPERVISOR" | "DISPATCHER" | "FIELD_AGENT" | "AGENT";
  /** Updated department identifier. */
  departmentId?: string;
}

/**
 * Response shape for the deactivate user endpoint.
 */
export interface DeactivateUserResponse {
  /** Identifier of the deactivated user. */
  deactivatedUserId: string;
  /** Run identifiers that were unassigned as a result. */
  affectedRunIds: string[];
}
