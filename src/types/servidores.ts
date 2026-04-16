import type { Papel } from "@/models/Servidor";

/**
 * Input contract for creating a new servidor.
 */
export interface CreateServidorInput {
  /** Full name of the servidor. */
  nome: string;
  /** CPF number — 11 unformatted digits. */
  cpf: string;
  /** Institutional email address. */
  email: string;
  /** Contact phone number. */
  telefone: string;
  /** Reference to the associated cargo. */
  cargoId: string;
  /** Reference to the associated lotação. */
  lotacaoId: string;
  /** System roles to assign. */
  papeis: Papel[];
}

/**
 * Input contract for partially updating an existing servidor.
 * All fields are optional — only send what needs to change.
 */
export interface UpdateServidorInput {
  /** Updated full name. */
  nome?: string;
  /** Updated phone number. */
  telefone?: string;
  /** Updated cargo reference. */
  cargoId?: string;
  /** Updated lotação reference. */
  lotacaoId?: string;
  /** Updated system roles. */
  papeis?: Papel[];
}

/**
 * Input contract for fetching a single servidor by identifier.
 */
export interface GetServidorByIdInput {
  /** Unique servidor identifier. */
  id: string;
}
