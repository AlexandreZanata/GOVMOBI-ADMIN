import { handleEnvelopedResponse } from "@/lib/handleApiResponse";
import type { Motorista } from "@/models/Motorista";
import type {
  CreateMotoristaInput,
  GetMotoristaByIdInput,
  UpdateMotoristaInput,
  UpdateMotoristaStatusInput,
} from "@/types/motoristas";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

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
    const response = await fetch(`${BASE_URL}/frota/motoristas`);
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
    const response = await fetch(`${BASE_URL}/frota/motoristas/${input.id}`);
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
    const response = await fetch(`${BASE_URL}/frota/motoristas`, {
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
    const response = await fetch(`${BASE_URL}/frota/motoristas/${id}`, {
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
    const response = await fetch(
      `${BASE_URL}/frota/motoristas/${id}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
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
    const response = await fetch(
      `${BASE_URL}/frota/motoristas/${id}/desativar`,
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
    const response = await fetch(
      `${BASE_URL}/frota/motoristas/${id}/reativar`,
      { method: "PATCH" }
    );
    return handleEnvelopedResponse<Motorista>(response);
  },
};
