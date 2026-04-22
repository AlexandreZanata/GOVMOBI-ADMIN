/**
 * Input contract for creating a new cargo.
 */
export interface CreateCargoInput {
  /** Display name of the cargo. */
  nome: string;
  /** Priority weight for dispatch ordering (0–100). */
  pesoPrioridade: number;
  /** Hierarchical level of the cargo. */
  nivelHierarquia: number;
}

/**
 * Input contract for updating an existing cargo.
 * All fields are required — the API performs a full replacement (PUT).
 */
export interface UpdateCargoInput {
  /** Updated display name. */
  nome: string;
  /** Updated priority weight (0–100). */
  pesoPrioridade: number;
  /** Updated hierarchical level. */
  nivelHierarquia: number;
}

/**
 * Input contract for fetching a single cargo by identifier.
 */
export interface GetCargoByIdInput {
  /** Unique cargo identifier. */
  id: string;
}
