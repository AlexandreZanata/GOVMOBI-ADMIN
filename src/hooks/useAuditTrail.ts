"use client";

import { useQuery } from "@tanstack/react-query";

import { auditFacade } from "@/facades/auditFacade";
import { auditKeys } from "@/lib/queryKeys/auditKeys";
import type { AuditEntry, AuditPage } from "@/models/AuditEntry";
import type { AuditFilters } from "@/types/audit";

const DEFAULT_LIMIT = 20;

export interface UseAuditTrailResult {
  data: AuditEntry[];
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

/**
 * Fetches a page of audit events from GET /admin/auditoria.
 */
export function useAuditTrail(filters: AuditFilters = {}): UseAuditTrailResult {
  const normalizedFilters: AuditFilters = {
    limit: DEFAULT_LIMIT,
    page: 1,
    ...filters,
  };

  const query = useQuery<AuditPage, Error>({
    queryKey: auditKeys.trail(normalizedFilters),
    queryFn: () => auditFacade.listAuditoria(normalizedFilters),
    staleTime: 30_000,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 0,
    currentPage: query.data?.page ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
  };
}
