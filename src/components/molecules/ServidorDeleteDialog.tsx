"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { useDeleteServidor } from "@/hooks/servidores/useDeleteServidor";

/**
 * Props for the servidor soft-delete confirmation dialog.
 */
export interface ServidorDeleteDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Identifier of the servidor to deactivate. */
  servidorId: string;
  /** Display name shown in the confirmation body. */
  servidorNome: string;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Confirmation dialog for soft-deleting (deactivating) a servidor.
 * Displays the servidor name and a reversibility message.
 * Calls useDeleteServidor on confirm; closes on success.
 *
 * @param props.open - Whether the dialog is visible
 * @param props.onClose - Callback to close the dialog
 * @param props.servidorId - ID of the servidor to deactivate
 * @param props.servidorNome - Display name for the confirmation body
 * @param props.data-testid - Test selector prefix
 * @returns Accessible destructive confirmation dialog
 */
export function ServidorDeleteDialog({
  open,
  onClose,
  servidorId,
  servidorNome,
  "data-testid": testId,
}: ServidorDeleteDialogProps): React.ReactElement | null {
  const { t } = useTranslation("servidores");
  const headingId = useId();
  const deleteMutation = useDeleteServidor();

  if (!open) return null;

  const handleConfirm = async (): Promise<void> => {
    await deleteMutation.mutateAsync(
      { id: servidorId },
      { onSuccess: onClose }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      data-testid={testId}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2 id={headingId} className="text-base font-semibold text-neutral-900">
          {t("actions.delete")}
        </h2>

        <p className="mt-2 text-sm text-neutral-700">
          {t("delete.confirmation", { nome: servidorNome })}
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {t("delete.reversible")}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "servidor-delete-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t("form.cancel")}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "servidor-delete-confirm"}
            variant="destructive"
            onClick={() => void handleConfirm()}
            isLoading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
            autoFocus
          >
            {t("actions.delete")}
          </Button>
        </div>
      </section>
    </div>
  );
}
