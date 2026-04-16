"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Motorista } from "@/models/Motorista";
import type { UpdateMotoristaStatusInput } from "@/types/motoristas";
import { ApiError } from "@/types";

/**
 * Input for the update motorista status mutation.
 */
export interface UpdateMotoristaStatusMutationInput
  extends UpdateMotoristaStatusInput {
  /** Identifier of the motorista whose status will be updated. */
  id: string;
}

/**
 * Mutation hook for updating a motorista's operational status.
 * On success, invalidates both the list and the detail cache entry.
 * On 404, shows a not-found error toast.
 * On 400, shows an invalid-data error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useUpdateMotoristaStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["motoristas", "common"]);

  return useMutation<
    Motorista,
    ApiError,
    UpdateMotoristaStatusMutationInput
  >({
    mutationFn: ({ id, statusOperacional }) =>
      motoristasFacade.updateMotoristaStatus(id, { statusOperacional }),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: motoristasKeys.detail(id),
      });
      toast.success(t("toast.statusUpdated"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else if (error.status === 400) {
        toast.error(t("toast.invalidData"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
