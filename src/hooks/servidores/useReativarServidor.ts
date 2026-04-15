"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import type { Servidor } from "@/models/Servidor";
import { ApiError } from "@/types";

/**
 * Input for the reativar servidor mutation.
 */
export interface ReativarServidorMutationInput {
  /** Identifier of the servidor to reactivate. */
  id: string;
}

/**
 * Mutation hook for reactivating a previously soft-deleted servidor.
 * On success, invalidates the servidor list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useReativarServidor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["servidores", "common"]);

  return useMutation<Servidor, ApiError, ReativarServidorMutationInput>({
    mutationFn: ({ id }) => servidoresFacade.reativarServidor(id),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.list() });
      void queryClient.invalidateQueries({
        queryKey: servidoresKeys.detail(id),
      });
      toast.success(t("toast.reativado"));
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
