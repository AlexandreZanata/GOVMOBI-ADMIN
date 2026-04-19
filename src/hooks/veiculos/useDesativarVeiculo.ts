"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { veiculosFacade } from "@/facades/veiculosFacade";
import { veiculosKeys } from "@/lib/queryKeys/veiculosKeys";
import type { Veiculo } from "@/models/Veiculo";
import { ApiError } from "@/types";

/**
 * Mutation hook for soft-deactivating a vehicle.
 */
export function useDesativarVeiculo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["veiculos", "common"]);

  return useMutation<Veiculo, ApiError, { id: string }>({
    mutationFn: ({ id }) => veiculosFacade.desativarVeiculo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: veiculosKeys.list() });
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
