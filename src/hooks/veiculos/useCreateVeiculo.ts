"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { veiculosFacade } from "@/facades/veiculosFacade";
import { veiculosKeys } from "@/lib/queryKeys/veiculosKeys";
import type { Veiculo } from "@/models/Veiculo";
import type { CreateVeiculoInput } from "@/types/veiculos";
import { ApiError } from "@/types";

/**
 * Mutation hook for registering a new vehicle.
 * On success, invalidates the vehicle list cache and shows a success toast.
 * On 409, shows a duplicate-plate error toast.
 */
export function useCreateVeiculo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["veiculos", "common"]);

  return useMutation<Veiculo, ApiError, CreateVeiculoInput>({
    mutationFn: (input) => veiculosFacade.createVeiculo(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: veiculosKeys.list() });
      toast.success(t("toast.created"));
    },
    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.duplicatePlaca"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
