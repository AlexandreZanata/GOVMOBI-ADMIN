"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import { ApiError } from "@/types";

/**
 * Input for the delete servidor mutation.
 */
export interface DeleteServidorMutationInput {
  /** Identifier of the servidor to soft-delete. */
  id: string;
}

/**
 * Mutation hook for soft-deleting a servidor.
 * On success, invalidates the servidor list cache and shows a success toast.
 * On 404, shows a not-found error toast.
 * On all other errors, shows a generic server error toast.
 *
 * @returns TanStack Query mutation object
 */
export function useDeleteServidor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["servidores", "common"]);

  return useMutation<void, ApiError, DeleteServidorMutationInput>({
    mutationFn: ({ id }) => servidoresFacade.deleteServidor(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.list() });
      toast.success(t("toast.deleted"));
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
