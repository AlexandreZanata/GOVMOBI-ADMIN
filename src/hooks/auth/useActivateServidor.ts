"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { authFacade } from "@/facades/authFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import type { Servidor } from "@/models/Servidor";
import type { ApiError } from "@/types";

/**
 * Mutation hook for activating a pending servidor registration (admin-only).
 *
 * On success the hook invalidates the servidores query cache so the list
 * reflects the updated status, and shows a success toast.
 *
 * @returns TanStack Query mutation object.
 */
export function useActivateServidor() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["servidores", "common"]);

  return useMutation<Servidor, ApiError, { id: string }>({
    mutationFn: ({ id }) => authFacade.activate(id),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.list() });
      toast.success(t("toast.activated"));
    },
  });
}
