import { getApiBase } from "@/lib/apiBase";
import { handleApiResponse } from "@/lib/handleApiResponse";
import type { User } from "@/models/User";
import type {
  CreateUserInput,
  DeactivateUserResponse,
  ListUsersInput,
  UpdateUserInput,
} from "@/types/users";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Paginated response shape for list endpoints.
 * @template T - Item type
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Facade for user-related business actions and API orchestration.
 * The users API does NOT use the `{ success, data, timestamp }` envelope —
 * `handleApiResponse` is used directly.
 */
export const usersFacade = {
  /**
   * Retrieves a paginated list of users with optional filters.
   *
   * @param input - Optional filter and pagination parameters
   * @returns Promise resolving to a paginated user list
   * @throws ApiError on non-2xx responses
   */
  async listUsers(
    input: ListUsersInput = {}
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    if (input.role) params.set("role", input.role);
    if (input.departmentId) params.set("departmentId", input.departmentId);
    if (input.status) params.set("status", input.status);
    if (input.page) params.set("page", String(input.page));
    if (input.pageSize) params.set("pageSize", String(input.pageSize));

    const qs = params.toString();
    const response = await fetch(
      `${baseUrl()}/users${qs ? `?${qs}` : ""}`
    );
    return handleApiResponse<PaginatedResponse<User>>(response);
  },

  /**
   * Creates a new user account.
   *
   * @param input - User creation payload
   * @returns Promise resolving to the created user
   * @throws ApiError 409 when a user with the same email already exists
   * @throws ApiError 422 on validation failure
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const response = await fetch(`${baseUrl()}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Partially updates an existing user's fields.
   *
   * @param id - Target user identifier
   * @param input - Partial update payload (name, role, departmentId)
   * @returns Promise resolving to the updated user
   * @throws ApiError 404 when the user does not exist
   * @throws ApiError 422 on validation failure (e.g. demoting last admin)
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const response = await fetch(`${baseUrl()}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleApiResponse<User>(response);
  },

  /**
   * Deactivates a user account and unassigns any active runs.
   *
   * @param id - Target user identifier
   * @returns Promise resolving to deactivation result with affected run IDs
   * @throws ApiError 404 when the user does not exist
   * @throws ApiError 422 when the user has IN_PROGRESS runs (returns affectedRunIds)
   */
  async deactivateUser(id: string): Promise<DeactivateUserResponse> {
    const response = await fetch(`${baseUrl()}/users/${id}/deactivate`, {
      method: "POST",
    });
    return handleApiResponse<DeactivateUserResponse>(response);
  },
};
