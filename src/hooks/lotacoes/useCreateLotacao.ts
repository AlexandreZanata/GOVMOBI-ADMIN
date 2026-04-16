"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { lotacoesFacade } from "@/facades/lotacoesFacade";
import { lotacoesKeys } from "@/lib/queryKeys/lotacoesKeys";
import type { Lotacao } from "@/models/Lotacao";
import type { CreateLotacaoInput } from "@/types/lotacoes";
import { ApiError } from "@/types";

/**
 * Mutation hook for creating a new lotacao.
 * On success, invalidates the lotacao list cache and shows a success toast.
 * On 409, shows a duplicate-name error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useCreateLotacao() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["lotacoes", "common"]);

  return useMutation<Lotacao, ApiError, CreateLotacaoInput>({
    mutationFn: (input) => lotacoesFacade.createLotacao(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lotacoesKeys.list() });
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
