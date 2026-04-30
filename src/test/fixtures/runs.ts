import { StatusOperacional } from "@/models";
import { Run, RunStatus } from "@/models/Run";

/**
 * Offset-based paginated response contract used by list endpoints.
 */
export interface PaginatedResponse<TItem> {
  /** Items returned for current page. */
  data: TItem[];
  /** Total number of matching items. */
  total: number;
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items requested per page. */
  limit: number;
  /** Total number of pages. */
  totalPages: number;
}

/**
 * Run summary item shape from `GET /corridas` - uses Run model directly.
 */
export type RunListItem = Run;

/**
 * Full run detail response shape from `GET /corridas/:id` - uses Run model directly.
 */
export type RunDetail = Run;

/**
 * Fixture dataset used by run MSW handlers - aligned with new API structure.
 */
export const runsFixture: RunListItem[] = [
  {
    id: "019db6ea-3ce3-7101-bbd5-0ae8a798ff44",
    status: RunStatus.EM_ROTA,
    passageiroId: "019db503-d53e-73c3-ad1a-5792f378bb11",
    motoristaId: "019db519-e90f-707a-a846-270683043600",
    veiculoId: "019db567-56b8-72af-bb30-8a4ef1c44258",
    origem: {
      lat: -12.5448043,
      lng: -55.7273902,
      endereco: "Rua Eurico Dutra 52, Sorriso - Mato Grosso, 78890-000, Brasil",
    },
    destino: {
      lat: -12.554074,
      lng: -55.737994,
      endereco: "Rua das Palmeiras 492, Jardim Aurora, Sorriso - Mato Grosso, 78892-128, Brasil",
    },
    motivoServico: "Transporte para reunião",
    distanciaMetros: null,
    duracaoSegundos: null,
    canceladoPor: null,
    motivoCancelamento: null,
    timestamps: {
      solicitadaEm: "2026-04-22T20:38:17.571Z",
      aceitaEm: "2026-04-22T20:38:21.967Z",
      iniciadaEm: "2026-04-22T20:38:28.968Z",
    },
    createdAt: "2026-04-22T20:38:17.571Z",
    updatedAt: "2026-04-22T20:39:05.128Z",
    motorista: {
      id: "019db519-e90f-707a-a846-270683043600",
      servidorId: "019db515-2d1a-75fa-9015-563c933cf793",
      cnhCategoria: "AB",
      statusOperacional: StatusOperacional.EM_CORRIDA,
      notaMedia: 5,
      totalAvaliacoes: 6,
    },
    veiculo: {
      id: "019db567-56b8-72af-bb30-8a4ef1c44258",
      placa: "VEI0C90",
      modelo: "Gol g5",
      ano: 2024,
      tipo: "sedan",
    },
    avaliacao: null,
  },
  {
    id: "019db6c2-6cca-77e6-b05f-c178a4e414c6",
    status: RunStatus.AVALIADA,
    passageiroId: "019db503-d53e-73c3-ad1a-5792f378bb11",
    motoristaId: "019db519-e90f-707a-a846-270683043600",
    veiculoId: "019db567-56b8-72af-bb30-8a4ef1c44258",
    origem: {
      lat: -12.544812,
      lng: -55.7273934,
      endereco: "Prefeitura Municipal, Sorriso - MT",
    },
    destino: {
      lat: -12.554074,
      lng: -55.737994,
      endereco: "Hospital Municipal, Sorriso - MT",
    },
    motivoServico: "Transporte médico",
    distanciaMetros: 1200,
    duracaoSegundos: 636,
    canceladoPor: null,
    motivoCancelamento: null,
    timestamps: {
      solicitadaEm: "2026-04-22T19:54:48.394Z",
      aceitaEm: "2026-04-22T19:54:50.697Z",
      embarqueEm: "2026-04-22T20:00:54.347Z",
      iniciadaEm: "2026-04-22T19:58:23.457Z",
      concluidaEm: "2026-04-22T20:11:31.244Z",
    },
    createdAt: "2026-04-22T19:54:48.394Z",
    updatedAt: "2026-04-22T20:11:37.874Z",
    motorista: {
      id: "019db519-e90f-707a-a846-270683043600",
      servidorId: "019db515-2d1a-75fa-9015-563c933cf793",
      cnhCategoria: "AB",
      statusOperacional: StatusOperacional.DISPONIVEL,
      notaMedia: 5,
      totalAvaliacoes: 6,
    },
    veiculo: {
      id: "019db567-56b8-72af-bb30-8a4ef1c44258",
      placa: "VEI0C90",
      modelo: "Gol g5",
      ano: 2024,
      tipo: "sedan",
    },
    avaliacao: {
      nota: 5,
      comentario: "Excelente serviço",
      createdAt: "2026-04-22T20:11:37.854Z",
    },
  },
  {
    id: "019db667-1052-772c-9454-5a01c2995056",
    status: RunStatus.CANCELADA,
    passageiroId: "019db503-d53e-73c3-ad1a-5792f378bb11",
    motoristaId: null,
    veiculoId: null,
    origem: {
      lat: -12.544812,
      lng: -55.7273934,
      endereco: "Secretaria de Educação, Sorriso - MT",
    },
    destino: {
      lat: -12.554074,
      lng: -55.737994,
      endereco: "Escola Municipal, Sorriso - MT",
    },
    motivoServico: "Visita técnica",
    distanciaMetros: null,
    duracaoSegundos: null,
    canceladoPor: "019db503-d53e-73c3-ad1a-5792f378bb11",
    motivoCancelamento: "Reunião cancelada",
    timestamps: {
      solicitadaEm: "2026-04-22T18:15:00.946Z",
      canceladaEm: "2026-04-22T18:40:48.527Z",
    },
    createdAt: "2026-04-22T18:15:00.946Z",
    updatedAt: "2026-04-22T18:40:48.527Z",
    motorista: null,
    veiculo: null,
    avaliacao: null,
  },
];

/**
 * Builds a detail fixture for a specific run id.
 *
 * @param runId - Target run identifier
 * @returns Run detail payload
 */
export function makeRunDetail(runId: string): RunDetail {
  const base = runsFixture.find((item) => item.id === runId);
  if (!base) {
    // Return first fixture as fallback
    return runsFixture[0];
  }
  return base;
}
