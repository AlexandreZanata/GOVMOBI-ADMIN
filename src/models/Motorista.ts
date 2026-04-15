/**
 * CNH (Brazilian driver's license) category union.
 * @todo Sync final values from Swagger once the /motoristas endpoint is published.
 */
export type CnhCategoria = "A" | "B" | "AB" | "C" | "D" | "E";

/**
 * Operational status of a motorista (driver).
 * @todo Sync final values from Swagger once the /motoristas endpoint is published.
 */
export type MotoristaStatusOperacional =
  | "DISPONIVEL"
  | "EM_SERVICO"
  | "INDISPONIVEL"
  | "AFASTADO";

/**
 * Core motorista (driver) contract matching the real API response shape.
 */
export interface Motorista {
  /** Unique motorista identifier (UUID v7). */
  id: string;
  /** Reference to the associated servidor (civil servant) record. */
  servidorId: string;
  /** Brazilian CNH (driver's license) number. */
  cnhNumero: string;
  /** CNH category (e.g. B, D, E). */
  cnhCategoria: CnhCategoria;
  /** Current operational status of the driver. */
  statusOperacional: MotoristaStatusOperacional;
  /** Whether the motorista record is active. */
  ativo: boolean;
  /** ISO 8601 timestamp when the record was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string;
  /** ISO 8601 timestamp when the record was soft-deleted, or null if active. */
  deletedAt: string | null;
}
