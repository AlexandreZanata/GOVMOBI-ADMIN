"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useCancelRun } from "@/hooks/runs/useCancelRun";

export interface RunCancelDialogProps {
  open: boolean;
  onClose: () => void;
  runId: string;
  /** ID of the admin user performing the cancellation. */
  solicitanteId: string;
  "data-testid"?: string;
}

/**
 * Confirmation dialog for cancelling an active corrida.
 * POST /corridas/{id}/cancelar
 */
export function RunCancelDialog({
  open,
  onClose,
  runId,
  solicitanteId,
  "data-testid": testId,
}: RunCancelDialogProps): React.ReactElement | null {
  const { t } = useTranslation("runs");
  const [motivo, setMotivo] = useState("");
  const cancelMutation = useCancelRun();

  const handleConfirm = async (): Promise<void> => {
    if (!motivo.trim()) return;
    await cancelMutation.mutateAsync(
      { id: runId, solicitanteId, motivo: motivo.trim(), tipoSolicitante: "admin" },
      { onSuccess: () => { setMotivo(""); onClose(); } },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("dialogs.cancel.title")}
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            data-testid={testId ? `${testId}-cancel` : "run-cancel-dialog-cancel"}
            onClick={onClose}
          >
            {t("dialogs.cancel.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            data-testid={testId ? `${testId}-confirm` : "run-cancel-dialog-confirm"}
            onClick={() => void handleConfirm()}
            isLoading={cancelMutation.isPending}
            disabled={cancelMutation.isPending || !motivo.trim()}
          >
            {t("dialogs.cancel.confirm")}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-neutral-600">{t("dialogs.cancel.description")}</p>
      <Input
        data-testid={testId ? `${testId}-motivo` : "run-cancel-dialog-motivo"}
        label={t("dialogs.cancel.motivoLabel")}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        aria-required="true"
        autoFocus
      />
    </Modal>
  );
}
