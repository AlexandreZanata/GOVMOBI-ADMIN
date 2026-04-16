/**
 * Input contract for creating a new lotacao.
 */
export interface CreateLotacaoInput {
  /** Display name of the lotacao. */
  nome: string;
}

/**
 * Input contract for updating an existing lotacao.
 */
export interface UpdateLotacaoInput {
  /** Updated display name. */
  nome: string;
}

/**
 * Input contract for fetching a single lotacao by identifier.
 */
export interface GetLotacaoByIdInput {
  /** Unique lotacao identifier. */
  id: string;
}
