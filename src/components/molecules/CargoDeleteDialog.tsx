"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useDeleteCargo } from "@/hooks/cargos/useDeleteCargo";

/**
 * Props for the cargo soft-delete confirmation dialog.
 */
export interface CargoDeleteDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Identifier of the cargo to deactivate. */
  cargoId: string;
  /** Display name shown in the confirmation body. */
  cargoNome: string;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Confirmation dialog for soft-deleting (deactivating) a cargo.
 * Displays the cargo name and a reversibility message.
 * Calls useDeleteCargo on confirm; closes on success.
 *
 * @param props.open - Whether the dialog is visible
 * @param props.onClose - Callback to close the dialog
 * @param props.cargoId - ID of the cargo to deactivate
 * @param props.cargoNome - Display name for the confirmation body
 * @param props.data-testid - Test selector prefix
 * @returns Accessible destructive confirmation dialog
 */
export function CargoDeleteDialog({
  open,
  onClose,
  cargoId,
  cargoNome,
  "data-testid": testId,
}: CargoDeleteDialogProps): React.ReactElement | null {
  const { t } = useTranslation("cargos");
  const deleteMutation = useDeleteCargo();

  const handleConfirm = async (): Promise<void> => {
    await deleteMutation.mutateAsync(
      { id: cargoId },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("actions.delete")}
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "cargo-delete-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t("form.cancel")}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "cargo-delete-confirm"}
            variant="destructive"
            onClick={() => void handleConfirm()}
            isLoading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
            autoFocus
          >
            {t("actions.delete")}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-neutral-700">
        {t("delete.confirmation", { nome: cargoNome })}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        {t("delete.reversible")}
      </p>
    </Modal>
  );
}
