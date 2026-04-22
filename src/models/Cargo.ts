/**
 * Core cargo (job position) contract matching the real API response shape.
 */
export interface Cargo {
  /** Unique cargo identifier (UUID v7). */
  id: string;
  /** Display name of the cargo. */
  nome: string;
  /** Priority weight used for dispatch ordering (0–100). */
  pesoPrioridade: number;
  /** Hierarchical level of the cargo. */
  nivelHierarquia: number;
  /** Whether the cargo is currently active. */
  ativo: boolean;
  /** ISO 8601 timestamp when the cargo was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string;
  /** ISO 8601 timestamp when the cargo was soft-deleted, or null if active. */
  deletedAt: string | null;
}
