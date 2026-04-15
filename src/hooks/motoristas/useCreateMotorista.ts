"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { motoristasFacade } from "@/facades/motoristasFacade";
import { motoristasKeys } from "@/lib/queryKeys/motoristasKeys";
import type { Motorista } from "@/models/Motorista";
import type { CreateMotoristaInput } from "@/types/motoristas";
import { ApiError } from "@/types";

/**
 * Mutation hook for registering a new motorista.
 * On success, invalidates the motorista list cache and shows a success toast.
 * On 409, shows a duplicate-CNH error toast.
 * On 400, shows an invalid-data error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useCreateMotorista() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["motoristas", "common"]);

  return useMutation<Motorista, ApiError, CreateMotoristaInput>({
    mutationFn: (input) => motoristasFacade.createMotorista(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: motoristasKeys.list() });
      toast.success(t("toast.created"));
    },

    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.duplicateCnh"));
      } else if (error.status === 400) {
        toast.error(t("toast.invalidData"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
