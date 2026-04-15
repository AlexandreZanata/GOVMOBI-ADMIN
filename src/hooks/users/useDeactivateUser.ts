"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { usersFacade } from "@/facades/usersFacade";
import { usersKeys } from "@/lib/queryKeys/usersKeys";
import type { DeactivateUserResponse } from "@/types/users";
import { ApiError } from "@/types";

/**
 * Input for the deactivate user mutation.
 */
export interface DeactivateUserInput {
  /** Identifier of the user to deactivate. */
  id: string;
}

/**
 * Mutation hook for deactivating a user account.
 * On success, invalidates the user list cache and shows a success toast.
 * If the deactivation affected active runs, shows a warning toast with the count.
 * On 404, shows a not-found error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");

  return useMutation<DeactivateUserResponse, ApiError, DeactivateUserInput>({
    mutationFn: ({ id }) => usersFacade.deactivateUser(id),

    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      toast.success(t("toast.deactivated"));

      if (result.affectedRunIds.length > 0) {
        toast.warning(
          t("toast.hasActiveRuns", { count: result.affectedRunIds.length })
        );
      }
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else {
        toast.error(t("toast.notFound"));
      }
    },
  });
}
