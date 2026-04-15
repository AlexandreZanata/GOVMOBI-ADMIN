import { handleApiResponse } from "@/lib/handleApiResponse";
import type { Run } from "@/models";
import type { GetRunByIdInput, OverrideRunInput } from "@/types";

/**
 * Facade for run-related business actions and API orchestration.
 */
export const runsFacade = {
  /**
   * Retrieves the run list for dashboard and operations views.
   *
   * @returns Promise resolving to run contracts
   * @throws Error when backend returns non-2xx status
   */
  async listRuns(): Promise<Run[]> {
    const response = await fetch("/api/runs");
    return handleApiResponse<Run[]>(response);
  },

  /**
   * Retrieves a single run by identifier.
   *
   * @param input - Run lookup input containing the run identifier
   * @returns Promise resolving to the requested run contract
   * @throws ApiError on 400, 403, 404, and 500 responses
   */
  async getRunById(input: GetRunByIdInput): Promise<Run> {
    const response = await fetch(`/v1/runs/${input.runId}`, {
      method: "GET",
    });

    return handleApiResponse<Run>(response);
  },

  /**
   * Overrides run execution details after elevated authorization.
   *
   * @param input - Override payload with run id, reason, and audit event
   * @returns Promise resolving to the updated run
   * @throws ApiError on 400, 403, 404, 409, and 500 responses
   */
  async overrideRun(input: OverrideRunInput): Promise<Run> {
    const response = await fetch(`/v1/runs/${input.runId}/override`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: input.reason,
        auditEvent: input.auditEvent,
      }),
    });

    return handleApiResponse<Run>(response);
  },
};
