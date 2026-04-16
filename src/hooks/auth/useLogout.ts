"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { authFacade } from "@/facades/authFacade";
import { useAuthStore } from "@/stores/authStore";
import type { ApiError } from "@/types";

/**
 * Mutation hook for logging the current user out.
 *
 * On success the hook clears the Zustand session store, wipes the entire
 * TanStack Query cache (so no stale authenticated data remains), and
 * redirects the user to `/login`.
 *
 * @returns TanStack Query mutation object.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation<void, ApiError, void>({
    mutationFn: () => authFacade.logout(),

    onSuccess: () => {
      clearSession();
      queryClient.clear();
      router.push("/login");
    },
  });
}
