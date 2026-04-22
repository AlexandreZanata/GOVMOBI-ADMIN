/**
 * Corrida (ride) lifecycle status values matching the real API.
 */
export enum RunStatus {
  SOLICITADA = "solicitada",
  AGUARDANDO_ACEITE = "aguardando_aceite",
  ACEITA = "aceita",
  EM_ROTA = "em_rota",
  PASSAGEIRO_A_BORDO = "passageiro_a_bordo",
  CONCLUIDA = "concluida",
  AVALIADA = "avaliada",
  CANCELADA = "cancelada",
  EXPIRADA = "expirada",
}

/**
 * Geographic coordinate for origin/destination.
 * The API now returns the resolved address string alongside coordinates.
 */
export interface RunCoordinate {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
  /** Human-readable address resolved by the backend, or null if not yet available. */
  endereco: string | null;
}

/**
 * Motorista position included in active runs response.
 */
export interface MotoristaPosition {
  lat: number;
  lng: number;
  updatedAt: string;
}

/**
 * Embedded motorista summary returned inside a corrida.
 */
export interface RunMotorista {
  id: string;
  servidorId: string;
  cnhCategoria: string;
  statusOperacional: string;
  notaMedia: number | null;
  totalAvaliacoes: number;
}

/**
 * Embedded vehicle summary returned inside a corrida.
 */
export interface RunVeiculo {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  tipo: string;
}

/**
 * Embedded rating (avaliação) returned inside a corrida.
 */
export interface RunAvaliacao {
  nota: number;
  comentario: string | null;
  createdAt: string;
}

/**
 * Lifecycle timestamps for a corrida.
 */
export interface RunTimestamps {
  solicitadaEm?: string | null;
  aceitaEm?: string | null;
  embarqueEm?: string | null;
  iniciadaEm?: string | null;
  concluidaEm?: string | null;
  canceladaEm?: string | null;
}

/**
 * Core corrida (ride) contract matching the real API response shape.
 * Endpoint: GET /corridas
 */
export interface Run {
  /** Unique corrida identifier (UUID v7). */
  id: string;
  /** Current lifecycle status. */
  status: RunStatus;
  /** Passenger (passageiro) identifier. */
  passageiroId: string;
  /** Assigned driver (motorista) identifier, or null if not yet assigned. */
  motoristaId: string | null;
  /** Assigned vehicle identifier, or null if not yet assigned. */
  veiculoId: string | null;
  /** Origin coordinate with resolved address. */
  origem: RunCoordinate;
  /** Destination coordinate with resolved address. */
  destino: RunCoordinate;
  /** Distance in meters, or null if not yet calculated. */
  distanciaMetros: number | null;
  /** Duration in seconds, or null if not yet calculated. */
  duracaoSegundos: number | null;
  /** Service reason (admin-created runs). */
  motivoServico?: string | null;
  /** Additional observations (admin-created runs). */
  observacoes?: string | null;
  /** ID of who cancelled the run, or null. */
  canceladoPor?: string | null;
  /** Cancellation reason, or null. */
  motivoCancelamento?: string | null;
  /** Legacy cancellation info shape (kept for backward compat). */
  cancelamento?: {
    motivo: string;
    tipoSolicitante: string;
    solicitanteId: string;
  } | null;
  /** Lifecycle timestamps. */
  timestamps?: RunTimestamps | null;
  /** Embedded motorista summary, or null if not yet assigned. */
  motorista?: RunMotorista | null;
  /** Embedded vehicle summary, or null if not yet assigned. */
  veiculo?: RunVeiculo | null;
  /** Embedded rating, or null if not yet rated. */
  avaliacao?: RunAvaliacao | null;
  /** Current motorista position (active runs only). */
  motoristaPosition?: MotoristaPosition | null;
  /** ISO 8601 timestamp when the corrida was created. */
  createdAt: string;
  /** ISO 8601 timestamp of the last update. */
  updatedAt: string;
}

/**
 * Paginated response from GET /corridas.
 */
export interface CorridasPage {
  data: Run[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Query filters for GET /corridas.
 */
export interface CorridasFilters {
  page?: number;
  limit?: number;
  status?: RunStatus | string;
}

/**
 * Input for POST /admin/corridas — admin-initiated run.
 */
export interface CreateAdminRunInput {
  passageiroId: string;
  origemLat: number;
  origemLng: number;
  destinoLat: number;
  destinoLng: number;
  motivoServico: string;
  observacoes?: string;
}

/**
 * Response from POST /admin/corridas.
 */
export interface CreateAdminRunResponse {
  corridaId: string;
}

/**
 * Input for POST /corridas/{id}/cancelar.
 * Backend DTO requires solicitanteId, motivo and tipoSolicitante.
 */
export interface CancelRunInput {
  id: string;
  solicitanteId: string;
  motivo: string;
  tipoSolicitante: "passageiro" | "motorista" | "admin";
}
