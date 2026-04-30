"use client";

import { useId, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Avatar } from "@/components/atoms/Avatar";
import { useUploadFotoPerfilMe } from "@/hooks/servidores/useUploadFotoPerfilMe";
import { useUploadFotoPerfilAdmin } from "@/hooks/servidores/useUploadFotoPerfilAdmin";
import { validateFile } from "@/lib/validateFile";
import type { ApiError } from "@/types";

export interface ProfilePhotoUploaderProps {
  /** "me" for the authenticated servidor's own photo; "admin" for any servidor */
  mode: "me" | "admin";
  /** Required when mode === "admin" — the target servidor's UUID */
  servidorId?: string;
  /** Servidor name — used for the Avatar aria-label and preview */
  servidorNome: string;
  /** Current photo URL to display before a new one is selected */
  currentFotoUrl?: string | null;
  /** Called after a successful upload with the new photo URL */
  onSuccess?: (fotoPerfilUrl: string) => void;
  /** Test selector prefix */
  "data-testid"?: string;
}

/**
 * Profile photo uploader molecule.
 *
 * Handles file selection, client-side validation (MIME type + size),
 * preview via URL.createObjectURL, and upload via the appropriate hook.
 * Supports two modes: "me" (own photo) and "admin" (any servidor).
 *
 * Accessibility:
 * - <input type="file"> with accept attribute and associated <label>
 * - aria-invalid + aria-describedby on error
 * - aria-label on the submit button
 * - All text via react-i18next
 */
export function ProfilePhotoUploader({
  mode,
  servidorId,
  servidorNome,
  currentFotoUrl,
  onSuccess,
  "data-testid": testId,
}: ProfilePhotoUploaderProps) {
  const { t } = useTranslation("servidores");
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prevSelectedFile, setPrevSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const uploadMe = useUploadFotoPerfilMe();
  const uploadAdmin = useUploadFotoPerfilAdmin();

  const isPending = mode === "me" ? uploadMe.isPending : uploadAdmin.isPending;
  const hasError = !!(validationError ?? apiError);
  const errorMessage = validationError ?? apiError;

  // Create and revoke object URL for preview — render-time update pattern
  if (selectedFile !== prevSelectedFile) {
    setPrevSelectedFile(selectedFile);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  }

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setApiError(null);
    setValidationError(null);
    setSelectedFile(null);

    if (!file) return;

    const result = validateFile(file);
    if (!result.valid) {
      if (result.error === "INVALID_TYPE") {
        setValidationError(t("profilePhoto.errors.invalidType"));
      } else {
        setValidationError(t("profilePhoto.errors.fileTooLarge"));
      }
      // Reset input so the same file can be re-selected after fixing
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isPending) return;

    setApiError(null);

    try {
      let result: { fotoPerfilUrl: string };

      if (mode === "me") {
        result = await uploadMe.mutateAsync(selectedFile);
      } else {
        if (!servidorId) return;
        result = await uploadAdmin.mutateAsync({ id: servidorId, file: selectedFile });
      }

      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onSuccess?.(result.fotoPerfilUrl);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 413) {
        setApiError(t("profilePhoto.errors.fileTooLarge"));
      } else if (apiErr.status === 404) {
        setApiError(t("profilePhoto.errors.serverNotFound"));
      } else if (apiErr.status === 400) {
        setApiError(t("profilePhoto.errors.invalidFile"));
      } else {
        setApiError(t("profilePhoto.errors.serverError"));
      }
    }
  };

  const displayUrl = previewUrl ?? currentFotoUrl ?? undefined;
  const hasSelection = !!selectedFile;

  return (
    <div
      data-testid={testId ?? "profile-photo-uploader"}
      className="flex flex-col gap-4"
    >
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <Avatar
          name={servidorNome}
          src={displayUrl}
          size="lg"
          data-testid={testId ? `${testId}-avatar` : "profile-photo-uploader-avatar"}
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-neutral-900">
            {t("profilePhoto.label")}
          </p>
          <p className="text-xs text-neutral-500">JPEG, PNG, WebP · máx. 5 MB</p>
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-3">
        {/* File input */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-neutral-700"
          >
            {hasSelection
              ? t("profilePhoto.buttonChange")
              : t("profilePhoto.buttonSelect")}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={isPending}
            aria-invalid={hasError ? "true" : undefined}
            aria-describedby={hasError ? errorId : undefined}
            data-testid={testId ? `${testId}-input` : "profile-photo-uploader-input"}
            className="block w-full text-sm text-neutral-700 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-primary hover:file:bg-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {hasError && (
            <p
              id={errorId}
              role="alert"
              className="text-xs text-danger"
              data-testid={testId ? `${testId}-error` : "profile-photo-uploader-error"}
            >
              {errorMessage}
            </p>
          )}
        </div>

        {/* Submit button — only shown when a valid file is selected */}
        {hasSelection && (
          <button
            type="submit"
            disabled={isPending}
            aria-label={t("profilePhoto.buttonSend")}
            aria-busy={isPending}
            data-testid={testId ? `${testId}-submit` : "profile-photo-uploader-submit"}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden="true"
                />
                {t("profilePhoto.uploading")}
              </>
            ) : (
              t("profilePhoto.buttonSend")
            )}
          </button>
        )}
      </form>
    </div>
  );
}
