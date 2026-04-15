"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { auditFacade } from "@/facades/auditFacade";
import { auditKeys } from "@/lib/queryKeys/auditKeys";
import type { AuditEntry } from "@/models";
import type { AuditFilters, AuditTrailPage } from "@/types";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Infinite query state exposed by the audit trail hook.
 */
export interface UseAuditTrailResult {
  /** Flattened list of audit entries accumulated across fetched pages. */
  data: AuditEntry[];
  /** Whether the first page is still loading. */
  isLoading: boolean;
  /** Whether the query has failed. */
  isError: boolean;
  /** Whether another page cursor is available. */
  hasNextPage: boolean;
  /** Whether a subsequent page is currently being fetched. */
  isFetchingNextPage: boolean;
  /** Requests the next cursor page and appends it. */
  fetchNextPage: () => Promise<unknown>;
  /** Refetches all loaded pages with current filters. */
  refetch: () => Promise<unknown>;
}

/**
 * Fetches audit entries with cursor-based pagination and append behavior.
 *
 * @param filters - Optional filters for event type, actor, entity, and date range
 * @returns Infinite-query state and actions for timeline rendering
 */
export function useAuditTrail(filters: AuditFilters = {}): UseAuditTrailResult {
  const normalizedFilters: AuditFilters = {
    ...filters,
    pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
  };

  const query = useInfiniteQuery<AuditTrailPage, Error>({
    queryKey: auditKeys.trail(normalizedFilters),
    queryFn: ({ pageParam }) =>
      auditFacade.listAuditTrail({
        filters: normalizedFilters,
        cursor: (pageParam as string | null | undefined) ?? null,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: null as string | null,
  });

  return {
    data: query.data?.pages.flatMap((page) => page.items) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => query.fetchNextPage(),
    refetch: () => query.refetch(),
  };
}
