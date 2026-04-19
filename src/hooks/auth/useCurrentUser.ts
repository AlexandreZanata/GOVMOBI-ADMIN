"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { authFacade } from "@/facades/authFacade";
import { authKeys } from "@/models/Auth";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/models/Auth";
import type { ApiError } from "@/types";

/**
 * Query hook that fetches the authenticated user profile via `GET /auth/me`.
 *
 * Used primarily by the `AuthGuard` to verify the session on mount / page
 * refresh. On a successful response the user is stored in the auth Zustand
 * store and `isHydrated` is set to `true`. On error, `isHydrated` is still
 * set to `true` so the guard can distinguish "still loading" from
 * "not authenticated".
 *
 * @returns `isLoading`, `isError`, `data` (AuthUser), `error`, and `refetch`.
 */
export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  const query = useQuery<AuthUser, ApiError>({
    queryKey: authKeys.me(),
    queryFn: () => authFacade.me(),
    // Don't retry on 401 — it means the session is gone
    retry: (failureCount, error) => {
      if ((error as ApiError).status === 401) return false;
      return failureCount < 2;
    },
    // Keep data fresh for 5 minutes — avoids unnecessary refetches
    staleTime: 5 * 60_000,
    // Don't refetch on window focus — avoids logout on tab switch
    refetchOnWindowFocus: false,
  });

  // Sync successful data into the auth store
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
      setHydrated(true);
    }
  }, [query.data, setUser, setHydrated]);

  // Mark hydration complete on error too (so AuthGuard can redirect)
  useEffect(() => {
    if (query.isError) {
      setHydrated(true);
    }
  }, [query.isError, setHydrated]);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    error: query.error,
    refetch: query.refetch,
  };
}
