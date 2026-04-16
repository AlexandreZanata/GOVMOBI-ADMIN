"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import type { Servidor } from "@/models/Servidor";
import type { CreateServidorInput } from "@/types/servidores";
import { ApiError } from "@/types";

/**
 * Mutation hook for creating a new servidor.
 * On success, invalidates the servidor list cache and shows a success toast.
 * On 409, shows a duplicate CPF/email error toast.
 * On 400, shows an invalid-data error toast.
 * On 404, shows a dependency-not-found error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useCreateServidor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["servidores", "common"]);

  return useMutation<Servidor, ApiError, CreateServidorInput>({
    mutationFn: (input) => servidoresFacade.createServidor(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.list() });
      toast.success(t("toast.created"));
    },

    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.duplicate"));
      } else if (error.status === 400) {
        toast.error(t("toast.invalidData"));
      } else if (error.status === 404) {
        toast.error(t("toast.dependencyNotFound"));
      } else {
        toast.error(t("common:toast.serverError"));
      }
    },
  });
}
