"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { runsFacade } from "@/facades/runsFacade";
import { runsKeys } from "@/lib/queryKeys/runsKeys";
import type { CreateAdminRunInput, CreateAdminRunResponse } from "@/models/Run";
import { ApiError } from "@/types";

/**
 * Mutation hook for creating a corrida on behalf of a servidor (admin only).
 * POST /admin/corridas
 */
export function useCreateAdminRun() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("runs");

  return useMutation<CreateAdminRunResponse, ApiError, CreateAdminRunInput>({
    mutationFn: (input) => runsFacade.createAdminRun(input),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: runsKeys.all });
      toast.success(t("toast.created"));
    },

    onError: (error) => {
      if (error.status === 409) {
        toast.error(t("toast.alreadyActive"));
      } else if (error.status === 403) {
        toast.error(t("toast.forbidden"));
      } else {
        toast.error(t("toast.createError"));
      }
    },
  });
}
