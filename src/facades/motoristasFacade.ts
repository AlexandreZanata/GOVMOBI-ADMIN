import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { handleEnvelopedResponse } from "@/lib/handleApiResponse";
import type { Motorista } from "@/models/Motorista";
import type {
  CreateMotoristaInput,
  GetMotoristaByIdInput,
  UpdateMotoristaInput,
  UpdateMotoristaStatusInput,
} from "@/types/motoristas";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Facade for motorista-related business actions and API orchestration.
 * All responses use the `{ success, data, timestamp }` envelope — unwrapped
 * transparently by `handleEnvelopedResponse`.
 *
 * Error surface:
 * - 400 validation failure (e.g. invalid CNH format)
 * - 404 motorista not found
 * - 409 duplicate CNH number
 * - 500 may occur on invalid UUID — treat as not found
 */
export const motoristasFacade = {
  /**
   * Retrieves all motoristas (active and inactive).
   *
   * @returns Promise resolving to the full motorista list
   * @throws ApiError on non-2xx responses
   */
  async listMotoristas(): Promise<Motorista[]> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/motoristas`);
    return handleEnvelopedResponse<Motorista[]>(response);
  },

  /**
   * Retrieves a single motorista by its identifier.
   *
   * @param input - Lookup input containing the motorista identifier
   * @returns Promise resolving to the requested motorista
   * @throws ApiError 404 when the motorista does not exist
   * @throws ApiError 500 when the backend receives an invalid UUID (treat as 404)
   */
  async getMotoristaById(input: GetMotoristaByIdInput): Promise<Motorista> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/motoristas/${input.id}`);
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Registers a new motorista linked to an existing servidor.
   *
   * @param input - Motorista creation payload
   * @returns Promise resolving to the created motorista
   * @throws ApiError 409 when a motorista with the same cnhNumero already exists
   * @throws ApiError 400 on validation failure
   */
  async createMotorista(input: CreateMotoristaInput): Promise<Motorista> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/motoristas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Replaces mutable license fields of an existing motorista.
   *
   * @param id - Target motorista identifier
   * @param input - Replacement payload (cnhNumero, cnhCategoria)
   * @returns Promise resolving to the updated motorista
   * @throws ApiError 404 when the motorista does not exist
   * @throws ApiError 409 when the new cnhNumero is already in use
   */
  async updateMotorista(
    id: string,
    input: UpdateMotoristaInput
  ): Promise<Motorista> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/motoristas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Updates the operational status of a motorista.
   *
   * @param id - Target motorista identifier
   * @param input - Status update payload
   * @returns Promise resolving to the updated motorista
   * @throws ApiError 404 when the motorista does not exist
   * @throws ApiError 400 on invalid status transition
   */
  async updateMotoristaStatus(
    id: string,
    input: UpdateMotoristaStatusInput
  ): Promise<Motorista> {
    const response = await fetchWithAuth(
      `${baseUrl()}/frota/motoristas/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // API expects { status: "DISPONIVEL" } not { statusOperacional: ... }
        body: JSON.stringify({ status: input.statusOperacional }),
      }
    );
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Soft-deactivates a motorista (sets `ativo: false`, records `deletedAt`).
   *
   * @param id - Target motorista identifier
   * @returns Promise resolving when the operation succeeds
   * @throws ApiError 404 when the motorista does not exist
   */
  async desativarMotorista(id: string): Promise<Motorista> {
    const response = await fetchWithAuth(
      `${baseUrl()}/frota/motoristas/${id}/desativar`,
      { method: "PATCH" }
    );
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Reactivates a previously deactivated motorista.
   *
   * @param id - Target motorista identifier
   * @returns Promise resolving to the reactivated motorista
   * @throws ApiError 404 when the motorista does not exist
   */
  async reativarMotorista(id: string): Promise<Motorista> {
    const response = await fetchWithAuth(
      `${baseUrl()}/frota/motoristas/${id}/reativar`,
      { method: "PATCH" }
    );
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Associates a vehicle to a motorista.
   * POST /frota/motoristas/{id}/veiculo
   */
  async associarVeiculo(motoristaId: string, veiculoId: string): Promise<Motorista> {
    const response = await fetchWithAuth(
      `${baseUrl()}/frota/motoristas/${motoristaId}/veiculo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ veiculoId }),
      }
    );
    return handleEnvelopedResponse<Motorista>(response);
  },

  /**
   * Removes the vehicle association from a motorista.
   * DELETE /frota/motoristas/{id}/veiculo
   */
  async desassociarVeiculo(motoristaId: string): Promise<void> {
    const response = await fetchWithAuth(
      `${baseUrl()}/frota/motoristas/${motoristaId}/veiculo`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      await handleEnvelopedResponse<never>(response);
    }
  },

  /**
   * Gets the vehicle currently associated to a motorista.
   * GET /frota/motoristas/{id}/veiculo
   */
  async getVeiculoDoMotorista(motoristaId: string): Promise<import("@/models/Veiculo").Veiculo | null> {
    const response = await fetchWithAuth(
      `${baseUrl()}/frota/motoristas/${motoristaId}/veiculo`
    );
    if (response.status === 404) return null;
    return handleEnvelopedResponse<import("@/models/Veiculo").Veiculo>(response);
  },

  /**
   * Gets the current location of a motorista through their active run.
   * First finds the active run for the motorista, then fetches the position.
   * GET /corridas/{id}/posicao-motorista
   * 
   * @param motoristaId - Target motorista identifier
   * @returns Promise resolving to the motorista's current position or null if unavailable
   * @throws ApiError 404 when the motorista has no active run or no position
   */
  async getPosicaoMotorista(motoristaId: string): Promise<{ lat: number; lng: number; atualizadoEm: string; corridaId: string; velocidade?: number; heading?: number } | null> {
    try {
      // First, we need to find the active run for this motorista
      // We'll fetch all runs and filter for active ones with this motorista
      if (process.env.NODE_ENV === "development") {
        console.log("[getPosicaoMotorista] Fetching runs for motorista:", motoristaId);
      }
      
      const runsResponse = await fetchWithAuth(`${baseUrl()}/corridas?page=1&limit=100`);
      const runsData = await import("@/lib/handleApiResponse").then(m => m.handleApiResponse<{ data: any[]; total: number }>(runsResponse));
      
      if (process.env.NODE_ENV === "development") {
        console.log("[getPosicaoMotorista] Total runs fetched:", runsData.data?.length || 0);
        console.log("[getPosicaoMotorista] Runs data:", runsData.data);
      }
      
      // Find active run for this motorista (status: aceita, em_rota, or passageiro_a_bordo)
      const activeStatuses = ['aceita', 'em_rota', 'passageiro_a_bordo'];
      const activeRun = runsData.data?.find(
        (run: any) => {
          const matches = run.motoristaId === motoristaId && activeStatuses.includes(run.status);
          if (process.env.NODE_ENV === "development" && run.motoristaId === motoristaId) {
            console.log("[getPosicaoMotorista] Found run for motorista:", {
              runId: run.id,
              status: run.status,
              motoristaId: run.motoristaId,
              matches
            });
          }
          return matches;
        }
      );
      
      if (!activeRun) {
        if (process.env.NODE_ENV === "development") {
          console.log("[getPosicaoMotorista] No active run found for motorista:", motoristaId);
        }
        return null; // No active run found
      }
      
      if (process.env.NODE_ENV === "development") {
        console.log("[getPosicaoMotorista] Active run found:", activeRun.id);
      }
      
      // Now fetch the position using the run ID
      const positionResponse = await fetchWithAuth(
        `${baseUrl()}/corridas/${activeRun.id}/posicao-motorista`
      );
      
      if (positionResponse.status === 404) {
        if (process.env.NODE_ENV === "development") {
          console.log("[getPosicaoMotorista] Position not found (404) for run:", activeRun.id);
        }
        return null;
      }
      
      const data = await import("@/lib/handleApiResponse").then(m => m.handleApiResponse<{ posicao: { lat: number; lng: number; velocidade?: number; heading?: number }; timestamp: number }>(positionResponse));
      
      if (process.env.NODE_ENV === "development") {
        console.log("[getPosicaoMotorista] Position data:", data);
      }
      
      return {
        lat: data.posicao.lat,
        lng: data.posicao.lng,
        velocidade: data.posicao.velocidade,
        heading: data.posicao.heading,
        atualizadoEm: new Date(data.timestamp).toISOString(),
        corridaId: activeRun.id,
      };
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[getPosicaoMotorista] Error:", error);
      }
      throw error;
    }
  },
};
