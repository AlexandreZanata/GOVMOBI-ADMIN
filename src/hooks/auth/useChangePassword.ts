"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authFacade } from "@/facades/authFacade";
import type { ApiError } from "@/types";

export interface UseChangePasswordParams {
  senhaAntiga: string;
  novaSenha: string;
}

/**
 * Mutation hook for changing the authenticated user's password.
 *
 * On success, displays a success toast. On error, the component
 * handles error display (no toast).
 *
 * @returns TanStack Query mutation object
 */
export function useChangePassword() {
  return useMutation<void, ApiError, UseChangePasswordParams>({
    mutationFn: ({ senhaAntiga, novaSenha }) =>
      authFacade.changePassword(senhaAntiga, novaSenha),
    
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    
    // No onError — dialog handles error display
  });
}
