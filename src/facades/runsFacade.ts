import type {Run} from "@/models";

/**
 * Error shape returned by GovMobile APIs.
 */
interface ApiErrorShape {
  /** Human-readable error message. */
  message?: string;
}

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

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorShape | null;
      throw new Error(body?.message ?? "REQUEST_FAILED");
    }

    return (await response.json()) as Run[];
  },
};
