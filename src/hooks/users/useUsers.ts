"use client";

import {
  useQuery,
  type QueryObserverResult,
  type RefetchOptions,
} from "@tanstack/react-query";

import { usersFacade, type PaginatedResponse } from "@/facades/usersFacade";
import { usersKeys } from "@/lib/queryKeys/usersKeys";
import type { User } from "@/models/User";
import type { ListUsersInput } from "@/types/users";

const DEFAULT_STALE_TIME_MS = 30_000;

/**
 * Fetches and caches a paginated user list through the users facade.
 *
 * @param filters - Optional filter and pagination parameters
 * @param staleTime - Query freshness window in milliseconds (default: 30000)
 * @returns TanStack Query state slice with `data`, `isLoading`, `isError`, and `refetch`
 */
export function useUsers(
  filters: ListUsersInput = {},
  staleTime = DEFAULT_STALE_TIME_MS
): {
  data: PaginatedResponse<User> | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<PaginatedResponse<User>, Error>>;
} {
  const query = useQuery<PaginatedResponse<User>, Error>({
    queryKey: usersKeys.list(filters),
    queryFn: () => usersFacade.listUsers(filters),
    staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
