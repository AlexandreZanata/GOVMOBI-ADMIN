"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { cargosFacade } from "@/facades/cargosFacade";
import { cargosKeys } from "@/lib/queryKeys/cargosKeys";
import type { Cargo } from "@/models/Cargo";
import { ApiError } from "@/types";

/**
 * Input for the reativar cargo mutation.
 */
export interface ReativarCargoInput {
  /** Identifier of the cargo to reactivate. */
  id: string;
}

/**
 * Mutation hook for reactivating a soft-deleted cargo.
 * On success, invalidates the cargo list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useReativarCargo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("cargos");

  return useMutation<Cargo, ApiError, ReativarCargoInput>({
    mutationFn: ({ id }) => cargosFacade.reativarCargo(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cargosKeys.list() });
      toast.success(t("toast.reativado"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else {
        toast.error(t("toast.notFound"));
      }
    },
  });
}
