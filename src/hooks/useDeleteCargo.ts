"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { cargosFacade } from "@/facades/cargosFacade";
import { cargosKeys } from "@/lib/queryKeys/cargosKeys";
import { ApiError } from "@/types";

/**
 * Input for the delete cargo mutation.
 */
export interface DeleteCargoInput {
  /** Identifier of the cargo to soft-delete. */
  id: string;
}

/**
 * Mutation hook for soft-deleting a cargo.
 * On success, invalidates the cargo list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useDeleteCargo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("cargos");

  return useMutation<void, ApiError, DeleteCargoInput>({
    mutationFn: ({ id }) => cargosFacade.deleteCargo(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cargosKeys.list() });
      toast.success(t("toast.deleted"));
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
