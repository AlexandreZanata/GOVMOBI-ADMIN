/**
 * Department domain model matching the real API response shape.
 */
export interface Department {
  /** Unique department identifier (UUID). */
  id: string;
  /** Display name of the department. */
  name: string;
  /** Optional description of the department's purpose. */
  description: string | null;
  /** Number of users assigned to this department. */
  userCount: number;
  /** Number of currently active runs in this department. */
  activeRunCount: number;
  /** ISO 8601 timestamp when the department was created. */
  createdAt: string;
}
