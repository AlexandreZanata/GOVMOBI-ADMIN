import { Papel } from "./enums";

/**
 * Core servidor (public servant) contract matching the real API response shape.
 */
export interface Servidor {
  /** Unique servidor identifier (UUID v7). */
  id: string;
  /** Full name of the servidor. */
  nome: string;
  /** CPF number — stored as 11 unformatted digits. */
  cpf: string;
  /** Institutional email address. */
  email: string;
  /** Contact phone number. */
  telefone: string;
  /** Reference to the associated cargo (job position). */
  cargoId: string;
  /** Reference to the associated lotação (department unit). */
  lotacaoId: string;
  /** System roles assigned to this servidor. */
  papeis: Papel[];
  /** Whether the servidor record is active. */
  ativo: boolean;
  /** ISO 8601 timestamp when the record was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string;
  /** ISO 8601 timestamp when the record was soft-deleted, or null if active. */
  deletedAt: string | null;
}
