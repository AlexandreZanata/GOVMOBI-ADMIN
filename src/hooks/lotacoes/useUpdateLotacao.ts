"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { lotacoesFacade } from "@/facades/lotacoesFacade";
import { lotacoesKeys } from "@/lib/queryKeys/lotacoesKeys";
import type { Lotacao } from "@/models/Lotacao";
import type { UpdateLotacaoInput } from "@/types/lotacoes";
import { ApiError } from "@/types";

/**
 * Input for the update lotacao mutation — combines the target id with the
 * full replacement payload.
 */
export interface UpdateLotacaoMutationInput extends UpdateLotacaoInput {
  /** Identifier of the lotacao to update. */
  id: string;
}

/**
 * Mutation hook for updating an existing lotacao.
 * On success, invalidates both the list and the detail cache entry.
 * On 404, shows a not-found error toast.
 * On 409, shows a duplicate-name error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useUpdateLotacao() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("lotacoes");

  return useMutation<Lotacao, ApiError, UpdateLotacaoMutationInput>({
    mutationFn: ({ id, ...input }) => lotacoesFacade.updateLotacao(id, input),

    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: lotacoesKeys.list() });
      void queryClient.invalidateQueries({ queryKey: lotacoesKeys.detail(id) });
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
