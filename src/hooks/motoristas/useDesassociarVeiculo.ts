"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import { ApiError } from "@/types";

/**
 * Mutation hook for removing the vehicle association from a motorista.
 * DELETE /frota/motoristas/{id}/veiculo
 */
export function useDesassociarVeiculo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["motoristas", "common"]);

  return useMutation<void, ApiError, { motoristaId: string }>({
    mutationFn: ({ motoristaId }) =>
      motoristasFacade.desassociarVeiculo(motoristaId),

    onSuccess: (_, { motoristaId }) => {
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.list() });
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.detail(motoristaId) });
      toast.success(t("toast.veiculoDesassociado"));
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
