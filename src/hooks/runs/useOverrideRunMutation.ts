import { useMutation } from "@tanstack/react-query";

import { runsFacade } from "@/facades/runsFacade";
import type { OverrideRunInput } from "@/types";
import type { Run } from "@/models";
import { ApiError } from "@/types";

/**
 * Mutation state and actions for run override operation.
 */
export interface OverrideRunMutationResult {
  /** Executes the override request. */
  mutateAsync: (input: OverrideRunInput) => Promise<Run>;
  /** Indicates whether the mutation is in progress. */
  isPending: boolean;
}

/**
 * Executes run override operations through the runs facade.
 *
 * @returns Mutation object with `mutateAsync`, `isPending`, and error metadata
 */
export function useOverrideRunMutation(): OverrideRunMutationResult {
  const mutation = useMutation<Run, ApiError, OverrideRunInput>({
    mutationFn: (input) => runsFacade.overrideRun(input),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
