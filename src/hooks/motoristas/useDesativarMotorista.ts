"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Motorista } from "@/models/Motorista";
import { ApiError } from "@/types";

/**
 * Input for the desativar motorista mutation.
 */
export interface DesativarMotoristaMutationInput {
  /** Identifier of the motorista to deactivate. */
  id: string;
}

/**
 * Mutation hook for soft-deactivating a motorista.
 * On success, invalidates the motorista list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useDesativarMotorista() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["motoristas", "common"]);

  return useMutation<Motorista, ApiError, DesativarMotoristaMutationInput>({
    mutationFn: ({ id }) => motoristasFacade.desativarMotorista(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.list() });
      toast.success(t("toast.desativado"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
