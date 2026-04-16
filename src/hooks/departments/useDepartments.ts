"use client";

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { departmentsFacade } from "@/facades/departmentsFacade";
import type { PaginatedResponse } from "@/facades/usersFacade";
import { departmentsKeys } from "@/lib/queryKeys/departmentsKeys";
import type { Department } from "@/models/Department";

/** Departments change infrequently — 60s stale window. */
const DEFAULT_STALE_TIME_MS = 60_000;

/**
 * Fetches and caches the full department list through the departments facade.
 *
 * @returns TanStack Query state slice with `data`, `isLoading`, `isError`, and `refetch`
 */
export function useDepartments(): {
  data: PaginatedResponse<Department> | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<PaginatedResponse<Department>, Error>>;
} {
  const query = useQuery<PaginatedResponse<Department>, Error>({
    queryKey: departmentsKeys.list(),
    queryFn: () => departmentsFacade.listDepartments(),
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
