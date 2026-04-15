"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import type { Servidor } from "@/models/Servidor";
import type { UpdateServidorInput } from "@/types/servidores";
import { ApiError } from "@/types";

/**
 * Input for the update servidor mutation — combines the target id with the
 * partial update payload.
 */
export interface UpdateServidorMutationInput extends UpdateServidorInput {
  /** Identifier of the servidor to update. */
  id: string;
}

/**
 * Mutation hook for partially updating an existing servidor.
 * On success, invalidates both the list and the detail cache entry.
 * On 404, shows a dependency-not-found error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useUpdateServidor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["servidores", "common"]);

  return useMutation<Servidor, ApiError, UpdateServidorMutationInput>({
    mutationFn: ({ id, ...input }) =>
      servidoresFacade.updateServidor(id, input),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: servidoresKeys.detail(id),
      });
      toast.success(t("toast.updated"));
    },

    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("toast.dependencyNotFound"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
