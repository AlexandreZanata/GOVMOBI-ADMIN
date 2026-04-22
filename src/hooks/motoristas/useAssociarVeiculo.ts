"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Motorista } from "@/models/Motorista";
import { ApiError } from "@/types";

export interface AssociarVeiculoInput {
  motoristaId: string;
  veiculoId: string;
}

/**
 * Mutation hook for associating a vehicle to a motorista.
 * POST /frota/motoristas/{id}/veiculo
 */
export function useAssociarVeiculo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["motoristas", "common"]);

  return useMutation<Motorista, ApiError, AssociarVeiculoInput>({
    mutationFn: ({ motoristaId, veiculoId }) =>
      motoristasFacade.associarVeiculo(motoristaId, veiculoId),

    onSuccess: (_, { motoristaId }) => {
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.list() });
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.detail(motoristaId) });
      toast.success(t("toast.veiculoAssociado"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else if (error.status === 409) {
        toast.error(t("toast.veiculoJaAssociado"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
