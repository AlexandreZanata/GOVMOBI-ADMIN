"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { usersFacade } from "@/facades/usersFacade";
import { usersKeys } from "@/lib/queryKeys/usersKeys";
import type { User } from "@/models/User";
import type { UpdateUserInput } from "@/types/users";
import { ApiError } from "@/types";

/**
 * Input for the update user mutation — combines the target id with the
 * partial update payload.
 */
export interface UpdateUserMutationInput extends UpdateUserInput {
  /** Identifier of the user to update. */
  id: string;
}

/**
 * Mutation hook for partially updating an existing user.
 * On success, invalidates both the list and the detail cache entry.
 * On 404, shows a not-found error toast.
 * On 422, shows a validation error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("users");

  return useMutation<User, ApiError, UpdateUserMutationInput>({
    mutationFn: ({ id, ...input }) => usersFacade.updateUser(id, input),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
      toast.success(t("toast.updated"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else if (error.status === 422) {
        toast.error(t("toast.validationError"));
      } else {
        toast.error(t("toast.notFound"));
      }
    },
  });
}
