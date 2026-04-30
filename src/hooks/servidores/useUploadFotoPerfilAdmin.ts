"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { servidoresKeys } from "@/lib/queryKeys/servidoresKeys";
import type { ApiError } from "@/types";

interface UploadFotoPerfilAdminInput {
  id: string;
  file: File;
}

/**
 * Mutation hook for an admin to upload the profile photo of any servidor.
 *
 * On success, invalidates the TanStack Query cache for the updated servidor's
 * detail and the full list so the new fotoPerfilUrl is reflected everywhere.
 *
 * @returns TanStack Query mutation result with `mutateAsync({ id, file })`
 */
export function useUploadFotoPerfilAdmin() {
  const { t } = useTranslation("servidores");
  const queryClient = useQueryClient();

  return useMutation<{ fotoPerfilUrl: string }, ApiError, UploadFotoPerfilAdminInput>({
    mutationFn: ({ id, file }) => servidoresFacade.uploadFotoPerfilAdmin(id, file),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: servidoresKeys.list() });
      toast.success(t("profilePhoto.success"));
    },
    onError: (error) => {
      if (error.status === 404) {
        toast.error(t("profilePhoto.errors.serverNotFound"));
      } else if (error.status === 400) {
        toast.error(t("profilePhoto.errors.invalidFile"));
      } else if (error.code === "NETWORK_ERROR") {
        toast.error(t("common:errors.networkError"));
      } else {
        toast.error(t("profilePhoto.errors.serverError"));
      }
    },
  });
}
