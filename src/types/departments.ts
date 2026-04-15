/**
 * Input contract for creating a new department.
 */
export interface CreateDepartmentInput {
  /** Display name of the department (max 100 characters). */
  name: string;
  /** Optional description of the department's purpose (max 300 characters). */
  description?: string;
}
