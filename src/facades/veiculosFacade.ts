import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { handleEnvelopedResponse } from "@/lib/handleApiResponse";
import type { Veiculo } from "@/models/Veiculo";
import type {
  CreateVeiculoInput,
  GetVeiculoByIdInput,
  UpdateVeiculoInput,
} from "@/types/veiculos";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Facade for vehicle-related business actions and API orchestration.
 * All responses use the `{ success, data, timestamp }` envelope — unwrapped
 * transparently by `handleEnvelopedResponse`.
 */
export const veiculosFacade = {
  /**
   * Retrieves all vehicles (active and inactive).
   *
   * @returns Promise resolving to the full vehicle list
   * @throws ApiError on non-2xx responses
   */
  async listVeiculos(): Promise<Veiculo[]> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/veiculos?incluirInativos=true`);
    return handleEnvelopedResponse<Veiculo[]>(response);
  },

  /**
   * Retrieves a single vehicle by its identifier.
   *
   * @param input - Lookup input containing the vehicle identifier
   * @returns Promise resolving to the requested vehicle
   * @throws ApiError 404 when the vehicle does not exist
   */
  async getVeiculoById(input: GetVeiculoByIdInput): Promise<Veiculo> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/veiculos/${input.id}`);
    return handleEnvelopedResponse<Veiculo>(response);
  },

  /**
   * Registers a new vehicle.
   *
   * @param input - Vehicle creation payload
   * @returns Promise resolving to the created vehicle
   * @throws ApiError 409 when a vehicle with the same placa already exists
   */
  async createVeiculo(input: CreateVeiculoInput): Promise<Veiculo> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/veiculos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Veiculo>(response);
  },

  /**
   * Updates mutable fields of an existing vehicle.
   *
   * @param id - Target vehicle identifier
   * @param input - Update payload (modelo, ano)
   * @returns Promise resolving to the updated vehicle
   * @throws ApiError 404 when the vehicle does not exist
   */
  async updateVeiculo(id: string, input: UpdateVeiculoInput): Promise<Veiculo> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/veiculos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Veiculo>(response);
  },

  /**
   * Soft-deactivates a vehicle (sets `ativo: false`, records `deletedAt`).
   *
   * @param id - Target vehicle identifier
   * @returns Promise resolving to the deactivated vehicle
   * @throws ApiError 404 when the vehicle does not exist
   */
  async desativarVeiculo(id: string): Promise<Veiculo> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/veiculos/${id}/desativar`, {
      method: "PATCH",
    });
    return handleEnvelopedResponse<Veiculo>(response);
  },

  /**
   * Reactivates a previously deactivated vehicle.
   *
   * @param id - Target vehicle identifier
   * @returns Promise resolving to the reactivated vehicle
   * @throws ApiError 404 when the vehicle does not exist
   */
  async reativarVeiculo(id: string): Promise<Veiculo> {
    const response = await fetchWithAuth(`${baseUrl()}/frota/veiculos/${id}/reativar`, {
      method: "PATCH",
    });
    return handleEnvelopedResponse<Veiculo>(response);
  },
};
