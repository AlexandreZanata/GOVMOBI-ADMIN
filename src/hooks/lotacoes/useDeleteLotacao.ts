"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { lotacoesFacade } from "@/facades/lotacoesFacade";
import { lotacoesKeys } from "@/lib/queryKeys/lotacoesKeys";
import { ApiError } from "@/types";

/**
 * Input for the delete lotacao mutation.
 */
export interface DeleteLotacaoInput {
  /** Identifier of the lotacao to soft-delete. */
  id: string;
}

/**
 * Mutation hook for soft-deleting a lotacao.
 * On success, invalidates the lotacao list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useDeleteLotacao() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("lotacoes");

  return useMutation<void, ApiError, DeleteLotacaoInput>({
    mutationFn: ({ id }) => lotacoesFacade.deleteLotacao(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lotacoesKeys.list() });
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
