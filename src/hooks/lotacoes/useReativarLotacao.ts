"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { lotacoesFacade } from "@/facades/lotacoesFacade";
import { lotacoesKeys } from "@/lib/queryKeys/lotacoesKeys";
import type { Lotacao } from "@/models/Lotacao";
import { ApiError } from "@/types";

/**
 * Input for the reativar lotacao mutation.
 */
export interface ReativarLotacaoInput {
  /** Identifier of the lotacao to reactivate. */
  id: string;
}

/**
 * Mutation hook for reactivating a soft-deleted lotacao.
 * On success, invalidates the lotacao list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useReativarLotacao() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("lotacoes");

  return useMutation<Lotacao, ApiError, ReativarLotacaoInput>({
    mutationFn: ({ id }) => lotacoesFacade.reativarLotacao(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lotacoesKeys.list() });
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
