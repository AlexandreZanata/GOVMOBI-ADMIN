import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { handleApiResponse } from "@/lib/handleApiResponse";
import type { CorridasFilters, CorridasPage, Run } from "@/models/Run";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Facade for corrida (ride) business actions and API orchestration.
 * Endpoint: GET /corridas — returns { data, total, page, limit, totalPages }
 */
export const runsFacade = {
  /**
   * Retrieves a paginated list of corridas with optional filters.
   *
   * @param filters - Optional pagination and status filters
   * @returns Promise resolving to the paginated corridas response
   * @throws ApiError on non-2xx responses
   */
  async listRuns(filters: CorridasFilters = {}): Promise<CorridasPage> {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.status) params.set("status", filters.status);

    const query = params.toString();
    const url = `${baseUrl()}/corridas${query ? `?${query}` : ""}`;
    const response = await fetchWithAuth(url);
    return handleApiResponse<CorridasPage>(response);
  },

  /**
   * Retrieves a single corrida by identifier.
   *
   * @param id - Corrida identifier
   * @returns Promise resolving to the corrida
   * @throws ApiError 404 when not found
   */
  async getRunById(id: string): Promise<Run> {
    const response = await fetchWithAuth(`${baseUrl()}/corridas/${id}`);
    return handleApiResponse<Run>(response);
  },
};
