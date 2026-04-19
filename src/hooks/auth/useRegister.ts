"use client";

import { useMutation } from "@tanstack/react-query";

import { authFacade } from "@/facades/authFacade";
import type { RegisterInput } from "@/models/Auth";
import type { Servidor } from "@/models/Servidor";
import type { ApiError } from "@/types";

/**
 * Mutation hook for self-registering a new servidor (government employee).
 *
 * The hook delegates to `authFacade.register()` and exposes the standard
 * mutation state so the `RegisterForm` can display loading / error UI.
 *
 * @returns `mutate`, `isPending`, `isError`, and `error` from the mutation.
 */
export function useRegister() {
  return useMutation<Servidor, ApiError, RegisterInput>({
    mutationFn: (payload) => authFacade.register(payload),
  });
}
