import { getApiBase } from "@/lib/apiBase";
import { fetchWithAuth } from "@/facades/authFacade";
import { handleApiResponse } from "@/lib/handleApiResponse";
import type {
  CancelRunInput,
  CorridasFilters,
  CorridasPage,
  CreateAdminRunInput,
  CreateAdminRunResponse,
  Run,
} from "@/models/Run";

function baseUrl(): string {
  return getApiBase();
}

/**
 * Facade for corrida (ride) business actions and API orchestration.
 */
export const runsFacade = {
  /**
   * Retrieves a paginated list of corridas with optional filters.
   * GET /corridas
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
   * GET /corridas/{id}
   */
  async getRunById(id: string): Promise<Run> {
    const response = await fetchWithAuth(`${baseUrl()}/corridas/${id}`);
    return handleApiResponse<Run>(response);
  },

  /**
   * Cancels an active corrida.
   * POST /corridas/{id}/cancelar
   * Admin sends only { motivo } — the system resolves the solicitante from JWT.
   */
  async cancelRun(input: CancelRunInput): Promise<void> {
    const { id, motivo } = input;
    const response = await fetchWithAuth(`${baseUrl()}/corridas/${id}/cancelar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ motivo }),
    });
    if (!response.ok) {
      await handleApiResponse<never>(response);
    }
  },

  /**
   * Creates a corrida on behalf of a servidor (admin only).
   * POST /admin/corridas
   */
  async createAdminRun(input: CreateAdminRunInput): Promise<CreateAdminRunResponse> {
    const response = await fetchWithAuth(`${baseUrl()}/admin/corridas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return handleApiResponse<CreateAdminRunResponse>(response);
  },

  /**
   * Lists all active corridas with motorista position (admin only).
   * GET /admin/corridas/ativas
   */
  async listActiveRuns(): Promise<Run[]> {
    const response = await fetchWithAuth(`${baseUrl()}/admin/corridas/ativas`);
    return handleApiResponse<Run[]>(response);
  },
};
