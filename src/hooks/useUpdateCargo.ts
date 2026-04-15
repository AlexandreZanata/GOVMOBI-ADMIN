"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { cargosFacade } from "@/facades/cargosFacade";
import { cargosKeys } from "@/lib/queryKeys/cargosKeys";
import type { Cargo } from "@/models/Cargo";
import type { UpdateCargoInput } from "@/types/cargos";
import { ApiError } from "@/types";

/**
 * Input for the update cargo mutation — combines the target id with the
 * full replacement payload.
 */
export interface UpdateCargoMutationInput extends UpdateCargoInput {
  /** Identifier of the cargo to update. */
  id: string;
}

/**
 * Mutation hook for updating an existing cargo.
 * On success, invalidates both the list and the detail cache entry.
 * On 404, shows a not-found error toast.
 * On 409, shows a duplicate-name error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useUpdateCargo() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("cargos");

  return useMutation<Cargo, ApiError, UpdateCargoMutationInput>({
    mutationFn: ({ id, ...input }) => cargosFacade.updateCargo(id, input),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: cargosKeys.list() });
      void queryClient.invalidateQueries({ queryKey: cargosKeys.detail(id) });
      toast.success(t("toast.updated"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.notFound"));
      } else if (error.status === 409) {
        toast.error(t("toast.duplicateName"));
      } else {
        toast.error(t("toast.notFound"));
      }
    },
  });
}
