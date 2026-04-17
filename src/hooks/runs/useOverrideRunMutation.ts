import { useMutation } from "@tanstack/react-query";

import { fetchWithAuth } from "@/facades/authFacade";
import { handleApiResponse } from "@/lib/handleApiResponse";
import { getApiBase } from "@/lib/apiBase";
import type { OverrideRunInput } from "@/types";
import type { Run } from "@/models";
import { ApiError } from "@/types";

/**
 * Mutation state and actions for run override operation.
 */
export interface OverrideRunMutationResult {
  mutateAsync: (input: OverrideRunInput) => Promise<Run>;
  isPending: boolean;
}

/**
 * Executes corrida override operations.
 */
export function useOverrideRunMutation(): OverrideRunMutationResult {
  const mutation = useMutation<Run, ApiError, OverrideRunInput>({
    mutationFn: async (input) => {
      const response = await fetchWithAuth(
        `${getApiBase()}/corridas/${input.runId}/override`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: input.reason }),
        }
      );
      return handleApiResponse<Run>(response);
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
