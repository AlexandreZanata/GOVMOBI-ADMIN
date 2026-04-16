/**
 * Core lotacao (assignment/location unit) contract matching the real API response shape.
 */
export interface Lotacao {
  /** Unique lotacao identifier (UUID v7). */
  id: string;
  /** Display name of the lotacao. */
  nome: string;
  /** Whether the lotacao is currently active. */
  ativo: boolean;
  /** ISO 8601 timestamp when the lotacao was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string;
  /** ISO 8601 timestamp when the lotacao was soft-deleted, or null if active. */
  deletedAt: string | null;
}
