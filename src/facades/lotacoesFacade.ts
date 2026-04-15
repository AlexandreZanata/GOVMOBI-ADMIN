import { handleApiResponse, type ApiEnvelope } from "@/lib/handleApiResponse";
import type { Lotacao } from "@/models/Lotacao";
import type {
  CreateLotacaoInput,
  GetLotacaoByIdInput,
  UpdateLotacaoInput,
} from "@/types/lotacoes";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

interface SuccessEnvelope {
  success: boolean;
  data?: unknown;
  timestamp: string;
}

/**
 * Facade for lotacao-related business actions and API orchestration.
 * All methods consume the backend envelope and return unwrapped domain data.
 */
export const lotacoesFacade = {
  /**
   * Retrieves all lotacoes (active and inactive).
   *
   * @returns Promise resolving to the full lotacao list
   * @throws ApiError on non-2xx responses
   */
  async listLotacoes(): Promise<Lotacao[]> {
    const response = await fetch(`${BASE_URL}/lotacoes`);
    const payload = await handleApiResponse<ApiEnvelope<Lotacao[]>>(response);
    return payload.data;
  },

  /**
   * Retrieves a single lotacao by identifier.
   *
   * @param input - Lookup input containing the lotacao identifier
   * @returns Promise resolving to the requested lotacao
   * @throws ApiError 404 when the lotacao does not exist
   */
  async getLotacaoById(input: GetLotacaoByIdInput): Promise<Lotacao> {
    const response = await fetch(`${BASE_URL}/lotacoes/${input.id}`);
    const payload = await handleApiResponse<ApiEnvelope<Lotacao>>(response);
    return payload.data;
  },

  /**
   * Creates a new lotacao.
   *
   * @param input - Lotacao creation payload
   * @returns Promise resolving to the created lotacao
   * @throws ApiError 409 when a lotacao with the same nome already exists
   */
  async createLotacao(input: CreateLotacaoInput): Promise<Lotacao> {
    const response = await fetch(`${BASE_URL}/lotacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await handleApiResponse<ApiEnvelope<Lotacao>>(response);
    return payload.data;
  },

  /**
   * Replaces mutable fields of an existing lotacao.
   *
   * @param id - Target lotacao identifier
   * @param input - Full replacement payload
   * @returns Promise resolving to the updated lotacao
   * @throws ApiError 404 when the lotacao does not exist
   * @throws ApiError 409 when the new nome is already in use by another lotacao
   */
  async updateLotacao(id: string, input: UpdateLotacaoInput): Promise<Lotacao> {
    const response = await fetch(`${BASE_URL}/lotacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = await handleApiResponse<ApiEnvelope<Lotacao>>(response);
    return payload.data;
  },

  /**
   * Soft-deletes a lotacao.
   *
   * @param id - Target lotacao identifier
   * @returns Promise resolving when the operation succeeds
   * @throws ApiError 404 when the lotacao does not exist
   */
  async deleteLotacao(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/lotacoes/${id}`, {
      method: "DELETE",
    });
    const payload = await handleApiResponse<SuccessEnvelope>(response);
    void payload.data;
  },

  /**
   * Reactivates a previously soft-deleted lotacao.
   *
   * @param id - Target lotacao identifier
   * @returns Promise resolving to the reactivated lotacao
   * @throws ApiError 404 when the lotacao does not exist
   */
  async reativarLotacao(id: string): Promise<Lotacao> {
    const response = await fetch(`${BASE_URL}/lotacoes/${id}/reativar`, {
      method: "PATCH",
    });
    const payload = await handleApiResponse<ApiEnvelope<Lotacao>>(response);
    return payload.data;
  },
};
