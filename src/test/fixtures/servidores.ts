import type { Servidor } from "@/models/Servidor";

/**
 * Fixture dataset used by servidores MSW handlers and unit tests.
 */
export const mockServidores: Servidor[] = [
  {
    id: "srv-001",
    nome: "João Vitor Flávio Pinto",
    cpf: "04673024133",
    email: "jvflaviopinto@gmail.com",
    telefone: "66974002072",
    cargoId: "cargo-001",
    lotacaoId: "lotacao-001",
    papeis: ["USUARIO", "MOTORISTA"],
    ativo: true,
    createdAt: "2026-04-15T14:18:02.629Z",
    updatedAt: "2026-04-15T14:18:02.629Z",
    deletedAt: null,
  },
  {
    id: "srv-002",
    nome: "Ana Paula Souza",
    cpf: "98765432100",
    email: "ana.souza@gov.br",
    telefone: "21977776666",
    cargoId: "cargo-002",
    lotacaoId: "lotacao-002",
    papeis: ["USUARIO"],
    ativo: true,
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-10T10:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "srv-003",
    nome: "Carlos Eduardo Mendes",
    cpf: "11122233344",
    email: "c.mendes@gov.br",
    telefone: "11955554444",
    cargoId: "cargo-001",
    lotacaoId: "lotacao-003",
    papeis: ["ADMIN"],
    ativo: false,
    createdAt: "2026-04-08T09:00:00.000Z",
    updatedAt: "2026-04-14T08:00:00.000Z",
    deletedAt: "2026-04-14T08:00:00.000Z",
  },
];

/**
 * Builds a well-formed API envelope around a data payload.
 *
 * @param data - Payload to wrap
 * @returns Envelope object `{ success, data, timestamp }`
 */
export function makeEnvelope<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}
