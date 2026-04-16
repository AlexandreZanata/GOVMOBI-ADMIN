"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { usersFacade } from "@/facades/usersFacade";
import { usersKeys } from "@/lib/queryKeys/usersKeys";
import type { User } from "@/models/User";
import type { CreateUserInput } from "@/types/users";
import { ApiError } from "@/types";

/**
 * Mutation hook for creating a new user account.
 * On success, invalidates the user list cache and shows a success toast.
 * On 409, shows a duplicate-email error toast.
 * On 422, shows a validation error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["users", "common"]);

  return useMutation<User, ApiError, CreateUserInput>({
    mutationFn: (input) => usersFacade.createUser(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersKeys.list() });
      toast.success(t("toast.created"));
    },

    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.duplicateEmail"));
      } else if (error.status === 422) {
        toast.error(t("toast.validationError"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
