"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { runsFacade } from "@/facades/runsFacade";
import { runsKeys } from "@/lib/queryKeys/runsKeys";
import type { CancelRunInput } from "@/models/Run";
import { ApiError } from "@/types";

/**
 * Mutation hook for cancelling an active corrida.
 * POST /corridas/{id}/cancelar
 */
export function useCancelRun() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("runs");

  return useMutation<void, ApiError, CancelRunInput>({
    mutationFn: (input) => runsFacade.cancelRun(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runsKeys.all });
      toast.success(t("toast.cancelled"));
    },

    onError: (error) => {
      if (error.status === 400) {
        toast.error(t("toast.cannotCancel"));
      } else {
        toast.error(t("toast.cancelError"));
      }
    },
  });
}
