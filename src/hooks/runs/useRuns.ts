import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { runsFacade } from "@/facades/runsFacade";
import { runsKeys } from "@/lib/queryKeys/runsKeys";
import type { Run } from "@/models";

const DEFAULT_STALE_TIME_MS = 30_000;

/**
 * Fetches and caches operational runs through the runs facade.
 *
 * @param staleTime - Query freshness window in milliseconds (default: 30000)
 * @returns TanStack Query state slice containing `data`, `isLoading`, `isError`, and `refetch`
 */
export function useRuns(staleTime = DEFAULT_STALE_TIME_MS): {
  data: Run[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Run[], Error>>;
} {
  const query = useQuery<Run[], Error>({
    queryKey: runsKeys.list(),
    queryFn: () => runsFacade.listRuns(),
    staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
