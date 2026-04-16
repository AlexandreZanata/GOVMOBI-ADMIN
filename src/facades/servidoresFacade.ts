import { handleEnvelopedResponse } from "@/lib/handleApiResponse";
import type { Servidor } from "@/models/Servidor";
import type {
  CreateServidorInput,
  GetServidorByIdInput,
  UpdateServidorInput,
} from "@/types/servidores";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

/**
 * Facade for servidor-related business actions and API orchestration.
 * All responses use the `{ success, data, timestamp }` envelope — unwrapped
 * transparently by `handleEnvelopedResponse`.
 *
 * Error surface:
 * - 400 invalid CPF, email, or papeis
 * - 404 servidor, cargo, or lotação not found
 * - 409 CPF or email already registered
 */
export const servidoresFacade = {
  /**
   * Retrieves all servidores (active and inactive).
   *
   * @returns Promise resolving to the full servidor list
   * @throws ApiError on non-2xx responses
   */
  async listServidores(): Promise<Servidor[]> {
    const response = await fetch(`${BASE_URL}/servidores`);
    return handleEnvelopedResponse<Servidor[]>(response);
  },

  /**
   * Retrieves a single servidor by its identifier.
   *
   * @param input - Lookup input containing the servidor identifier
   * @returns Promise resolving to the requested servidor
   * @throws ApiError 404 when the servidor does not exist
   */
  async getServidorById(input: GetServidorByIdInput): Promise<Servidor> {
    const response = await fetch(`${BASE_URL}/servidores/${input.id}`);
    return handleEnvelopedResponse<Servidor>(response);
  },

  /**
   * Creates a new servidor.
   *
   * @param input - Servidor creation payload
   * @returns Promise resolving to the created servidor
   * @throws ApiError 400 on invalid CPF, email, or papeis
   * @throws ApiError 404 when cargoId or lotacaoId does not exist
   * @throws ApiError 409 when CPF or email is already registered
   */
  async createServidor(input: CreateServidorInput): Promise<Servidor> {
    const response = await fetch(`${BASE_URL}/servidores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Servidor>(response);
  },

  /**
   * Partially updates an existing servidor.
   *
   * @param id - Target servidor identifier
   * @param input - Partial update payload
   * @returns Promise resolving to the updated servidor
   * @throws ApiError 404 when the servidor, cargo, or lotação does not exist
   */
  async updateServidor(
    id: string,
    input: UpdateServidorInput
  ): Promise<Servidor> {
    const response = await fetch(`${BASE_URL}/servidores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleEnvelopedResponse<Servidor>(response);
  },

  /**
   * Soft-deletes a servidor (sets `ativo: false`, records `deletedAt`).
   *
   * @param id - Target servidor identifier
   * @returns Promise resolving when the operation succeeds
   * @throws ApiError 404 when the servidor does not exist
   */
  async deleteServidor(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/servidores/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      await handleEnvelopedResponse<never>(response);
    }
  },

  /**
   * Reactivates a previously soft-deleted servidor.
   *
   * @param id - Target servidor identifier
   * @returns Promise resolving to the reactivated servidor
   * @throws ApiError 404 when the servidor does not exist
   */
  async reativarServidor(id: string): Promise<Servidor> {
    const response = await fetch(`${BASE_URL}/servidores/${id}/reativar`, {
      method: "PATCH",
    });
    return handleEnvelopedResponse<Servidor>(response);
  },
};
