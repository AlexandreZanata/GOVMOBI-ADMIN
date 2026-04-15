"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Motorista } from "@/models/Motorista";
import type { UpdateMotoristaInput } from "@/types/motoristas";
import { ApiError } from "@/types";

/**
 * Input for the update motorista mutation — combines the target id with the
 * partial replacement payload.
 */
export interface UpdateMotoristaMutationInput extends UpdateMotoristaInput {
  /** Identifier of the motorista to update. */
  id: string;
}

/**
 * Mutation hook for updating an existing motorista's license data.
 * On success, invalidates both the list and the detail cache entry.
 * On 404, shows a not-found error toast.
 * On 409, shows a duplicate-CNH error toast.
 * On 400, shows an invalid-data error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useUpdateMotorista() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["motoristas", "common"]);

  return useMutation<Motorista, ApiError, UpdateMotoristaMutationInput>({
    mutationFn: ({ id, ...input }) =>
      motoristasFacade.updateMotorista(id, input),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: motoristasKeys.detail(id),
      });
      toast.success(t("toast.updated"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else if (error.status === 409) {
        toast.error(t("toast.duplicateCnh"));
      } else if (error.status === 400) {
        toast.error(t("toast.invalidData"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
