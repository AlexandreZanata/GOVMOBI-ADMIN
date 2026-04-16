import { getApiBase } from "@/lib/apiBase";
import { handleApiResponse } from "@/lib/handleApiResponse";
import type { Department } from "@/models/Department";
import type { CreateDepartmentInput } from "@/types/departments";
import type { PaginatedResponse } from "@/facades/usersFacade";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Facade for department-related business actions and API orchestration.
 * The departments API does NOT use the `{ success, data, timestamp }` envelope —
 * `handleApiResponse` is used directly.
 */
export const departmentsFacade = {
  /**
   * Retrieves a paginated list of all departments.
   *
   * @returns Promise resolving to a paginated department list
   * @throws ApiError on non-2xx responses
   */
  async listDepartments(): Promise<PaginatedResponse<Department>> {
    const response = await fetch(`${baseUrl()}/departments`);
    return handleApiResponse<PaginatedResponse<Department>>(response);
  },

  /**
   * Creates a new department.
   *
   * @param input - Department creation payload
   * @returns Promise resolving to the created department
   * @throws ApiError 409 when a department with the same name already exists
   * @throws ApiError 422 on validation failure
   */
  async createDepartment(input: CreateDepartmentInput): Promise<Department> {
    const response = await fetch(`${baseUrl()}/departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleApiResponse<Department>(response);
  },
};
