import { handleEnvelopedResponse } from "@/lib/handleApiResponse";
import type { Cargo } from "@/models/Cargo";
import type {
  CreateCargoInput,
  GetCargoByIdInput,
  UpdateCargoInput,
} from "@/types/cargos";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/**
 * Facade for cargo-related business actions and API orchestration.
 * All responses use the `{ success, data, timestamp }` envelope — unwrapped
 * transparently by `handleEnvelopedResponse`.
 */
export const cargosFacade = {
  /**
   * Retrieves all cargos (active and inactive).
   *
   * @returns Promise resolving to the full cargo list
   * @throws ApiError on non-2xx responses
   */
  async listCargos(): Promise<Cargo[]> {
    const response = await fetch(`${BASE_URL}/cargos`);
    return handleEnvelopedResponse<Cargo[]>(response);
  },

  /**
   * Retrieves a single cargo by its identifier.
   *
   * @param input - Lookup input containing the cargo identifier
   * @returns Promise resolving to the requested cargo
   * @throws ApiError 404 when the cargo does not exist
   */
  async getCargoById(input: GetCargoByIdInput): Promise<Cargo> {
    const response = await fetch(`${BASE_URL}/cargos/${input.id}`);
    return handleEnvelopedResponse<Cargo>(response);
  },

  /**
   * Creates a new cargo.
   *
   * @param input - Cargo creation payload
   * @returns Promise resolving to the created cargo
   * @throws ApiError 409 when a cargo with the same nome already exists
   */
  async createCargo(input: CreateCargoInput): Promise<Cargo> {
    const response = await fetch(`${BASE_URL}/cargos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Cargo>(response);
  },

  /**
   * Replaces all mutable fields of an existing cargo.
   *
   * @param id - Target cargo identifier
   * @param input - Full replacement payload
   * @returns Promise resolving to the updated cargo
   * @throws ApiError 404 when the cargo does not exist
   * @throws ApiError 409 when the new nome is already in use by another cargo
   */
  async updateCargo(id: string, input: UpdateCargoInput): Promise<Cargo> {
    const response = await fetch(`${BASE_URL}/cargos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Cargo>(response);
  },

  /**
   * Soft-deletes a cargo (sets `ativo: false`, records `deletedAt`).
   *
   * @param id - Target cargo identifier
   * @returns Promise resolving when the operation succeeds
   * @throws ApiError 404 when the cargo does not exist
   */
  async deleteCargo(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/cargos/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Re-use the enveloped helper to surface the typed ApiError
      await handleEnvelopedResponse<never>(response);
    }
  },

  /**
   * Reactivates a previously soft-deleted cargo.
   *
   * @param id - Target cargo identifier
   * @returns Promise resolving to the reactivated cargo
   * @throws ApiError 404 when the cargo does not exist
   */
  async reativarCargo(id: string): Promise<Cargo> {
    const response = await fetch(`${BASE_URL}/cargos/${id}/reativar`, {
      method: "PATCH",
    });
    return handleEnvelopedResponse<Cargo>(response);
  },
};
