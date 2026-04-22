/**
 * Corrida (ride) lifecycle status values matching the real API.
 */
export enum RunStatus {
  SOLICITADA = "solicitada",
  AGUARDANDO_ACEITE = "aguardando_aceite",
  ACEITA = "aceita",
  EM_ROTA = "em_rota",
  CONCLUIDA = "concluida",
  AVALIADA = "avaliada",
  CANCELADA = "cancelada",
  EXPIRADA = "expirada",
}

/**
 * Geographic coordinate for origin/destination.
 */
export interface RunCoordinate {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lng: number;
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
  /** Origin coordinate. */
  origem: RunCoordinate;
  /** Destination coordinate. */
  destino: RunCoordinate;
  /** Distance in meters, or null if not yet calculated. */
  distanciaMetros: number | null;
  /** Duration in seconds, or null if not yet calculated. */
  duracaoSegundos: number | null;
  /** Service reason (admin-created runs). */
  motivoServico?: string | null;
  /** Additional observations (admin-created runs). */
  observacoes?: string | null;
  /** Cancellation info, present when status is CANCELADA. */
  cancelamento?: {
    motivo: string;
    tipoSolicitante: string;
    solicitanteId: string;
  } | null;
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
 * The backend resolves solicitante and tipoSolicitante from the JWT.
 */
export interface CancelRunInput {
  id: string;
  motivo: string;
}
