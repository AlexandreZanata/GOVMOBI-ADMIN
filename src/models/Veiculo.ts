/**
 * Core vehicle contract matching the real API response shape.
 */
export interface Veiculo {
  /** Unique vehicle identifier (UUID v7). */
  id: string;
  /** Brazilian license plate (Mercosul format: ABC1D23). */
  placa: string;
  /** Vehicle model description. */
  modelo: string;
  /** Manufacturing year. */
  ano: number;
  /** Whether the vehicle record is active. */
  ativo: boolean;
  /** ISO 8601 timestamp when the record was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string;
  /** ISO 8601 timestamp when the record was soft-deleted, or null if active. */
  deletedAt: string | null;
}
