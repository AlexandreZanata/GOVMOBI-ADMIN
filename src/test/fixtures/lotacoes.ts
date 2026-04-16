import type { Lotacao } from "@/models/Lotacao";

/**
 * Fixture dataset used by lotacoes MSW handlers and unit tests.
 * Contains a realistic mix of active and inactive lotações.
 */
export const mockLotacoes: Lotacao[] = [
  {
    id: "lotacao-001",
    nome: "Secretaria de Fazenda",
    ativo: true,
    createdAt: "2026-04-15T14:00:00.000Z",
    updatedAt: "2026-04-15T14:00:00.000Z",
    deletedAt: null,
  },
  {
    id: "lotacao-002",
    nome: "Secretaria de Planejamento",
    ativo: true,
    createdAt: "2026-04-15T14:05:00.000Z",
    updatedAt: "2026-04-15T14:05:00.000Z",
    deletedAt: null,
  },
  {
    id: "lotacao-003",
    nome: "Controladoria Geral do Município",
    ativo: true,
    createdAt: "2026-04-15T14:10:00.000Z",
    updatedAt: "2026-04-15T14:10:00.000Z",
    deletedAt: null,
  },
  {
    id: "lotacao-004",
    nome: "Secretaria de Educação",
    ativo: false,
    createdAt: "2026-04-10T10:00:00.000Z",
    updatedAt: "2026-04-14T08:00:00.000Z",
    deletedAt: "2026-04-14T08:00:00.000Z",
  },
  {
    id: "lotacao-005",
    nome: "Secretaria de Saúde",
    ativo: false,
    createdAt: "2026-04-08T09:00:00.000Z",
    updatedAt: "2026-04-13T07:00:00.000Z",
    deletedAt: "2026-04-13T07:00:00.000Z",
  },
];

/**
 * Builds a well-formed API envelope around a data payload,
 * matching the real backend response shape.
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
