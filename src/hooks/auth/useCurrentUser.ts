"use client";

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
 * refresh.  On a successful response the user is stored in the auth Zustand
 * store and `isHydrated` is set to `true`.  On error, `isHydrated` is still
 * set to `true` so the guard can distinguish "still loading" from
 * "not authenticated".
 *
 * @returns `isLoading`, `isError`, `data` (AuthUser), and `error`.
 */
export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  const query = useQuery<AuthUser, ApiError>({
    queryKey: authKeys.me(),
    queryFn: () => authFacade.me(),
    select: (data) => {
      // Side-effect in select is intentional — keeps store in sync
      // whenever the query data changes (initial fetch or refetch).
      setUser(data);
      setHydrated(true);
      return data;
    },
    meta: {
      onError: () => {
        setHydrated(true);
      },
    },
  });

  // Handle error hydration via effect-free approach:
  // When the query errors, we still need to mark hydration complete.
  if (query.isError) {
    setHydrated(true);
  }

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    data: query.data,
    error: query.error,
    refetch: query.refetch,
  };
}
