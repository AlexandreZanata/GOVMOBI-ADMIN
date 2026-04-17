"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { veiculosFacade } from "@/facades/veiculosFacade";
import { veiculosKeys } from "@/lib/queryKeys/veiculosKeys";
import type { Veiculo } from "@/models/Veiculo";
import type { UpdateVeiculoInput } from "@/types/veiculos";
import { ApiError } from "@/types";

export interface UpdateVeiculoMutationInput extends UpdateVeiculoInput {
  id: string;
}

/**
 * Mutation hook for updating an existing vehicle.
 */
export function useUpdateVeiculo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["veiculos", "common"]);

  return useMutation<Veiculo, ApiError, UpdateVeiculoMutationInput>({
    mutationFn: ({ id, ...input }) => veiculosFacade.updateVeiculo(id, input),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: veiculosKeys.list() });
      void queryClient.invalidateQueries({ queryKey: veiculosKeys.detail(id) });
      toast.success(t("toast.updated"));
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
