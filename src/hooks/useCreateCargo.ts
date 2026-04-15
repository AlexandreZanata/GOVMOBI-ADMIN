"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { cargosFacade } from "@/facades/cargosFacade";
import { cargosKeys } from "@/lib/queryKeys/cargosKeys";
import type { Cargo } from "@/models/Cargo";
import type { CreateCargoInput } from "@/types/cargos";
import { ApiError } from "@/types";

/**
 * Mutation hook for creating a new cargo.
 * On success, invalidates the cargo list cache and shows a success toast.
 * On 409, shows a duplicate-name error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useCreateCargo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["cargos", "common"]);

  return useMutation<Cargo, ApiError, CreateCargoInput>({
    mutationFn: (input) => cargosFacade.createCargo(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cargosKeys.list() });
      toast.success(t("toast.created"));
    },

    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.duplicateName"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
