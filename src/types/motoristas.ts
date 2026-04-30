import type { CnhCategoria } from "@/models/Motorista";
import type { StatusOperacional } from "@/models";

/**
 * Input contract for registering a new motorista.
 */
export interface CreateMotoristaInput {
  /** Reference to the associated servidor (civil servant) record. */
  servidorId: string;
  /** Municipality identifier where the motorista operates. */
  municipioId: string;
  /** Brazilian CNH (driver's license) number. */
  cnhNumero: string;
  /** CNH category (e.g. B, D, E). */
  cnhCategoria: CnhCategoria;
}

/**
 * Input contract for updating an existing motorista's license data.
 * All fields are optional — the API performs a partial update (PATCH).
 */
export interface UpdateMotoristaInput {
  /** Updated CNH number. */
  cnhNumero?: string;
  /** Updated CNH category. */
  cnhCategoria?: CnhCategoria;
}

/**
 * Input contract for updating a motorista's operational status.
 */
export interface UpdateMotoristaStatusInput {
  /** New operational status to assign. */
  statusOperacional: StatusOperacional;
}

/**
 * Input contract for fetching a single motorista by identifier.
 */
export interface GetMotoristaByIdInput {
  /** Unique motorista identifier. */
  id: string;
}
