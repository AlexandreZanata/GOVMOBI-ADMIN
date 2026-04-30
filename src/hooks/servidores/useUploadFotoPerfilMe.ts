"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { servidoresFacade } from "@/facades/servidoresFacade";
import { useAuthStore } from "@/stores/authStore";
import type { ApiError } from "@/types";

/**
 * Mutation hook for uploading the authenticated servidor's own profile photo.
 *
 * On success, updates the `fotoPerfilUrl` field in the AuthStore so all
 * Avatar components that read from the store re-render automatically.
 *
 * @returns TanStack Query mutation result with `mutateAsync(file: File)`
 */
export function useUploadFotoPerfilMe() {
  const { t } = useTranslation("servidores");
  const updateFotoPerfilUrl = useAuthStore((s) => s.updateFotoPerfilUrl);

  return useMutation<{ fotoPerfilUrl: string }, ApiError, File>({
    mutationFn: (file: File) => servidoresFacade.uploadFotoPerfilMe(file),
    onSuccess: ({ fotoPerfilUrl }) => {
      updateFotoPerfilUrl(fotoPerfilUrl);
      toast.success(t("profilePhoto.success"));
    },
    onError: (error) => {
      if (error.status === 413) {
        toast.error(t("profilePhoto.errors.fileTooLarge"));
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
