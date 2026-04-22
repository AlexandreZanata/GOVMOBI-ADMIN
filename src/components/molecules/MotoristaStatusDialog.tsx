"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useUpdateMotoristaStatus } from "@/hooks/motoristas/useUpdateMotoristaStatus";
import type { Motorista, MotoristaStatusOperacional } from "@/models/Motorista";

const STATUS_OPTIONS: MotoristaStatusOperacional[] = [
  "DISPONIVEL",
  "EM_SERVICO",
  "INDISPONIVEL",
  "AFASTADO",
];

export interface MotoristaStatusDialogProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista;
  "data-testid"?: string;
}

/**
 * Dialog for updating a motorista's operational status.
 * PATCH /frota/motoristas/{id}/status
 */
export function MotoristaStatusDialog({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaStatusDialogProps) {
  const { t } = useTranslation("motoristas");
  const [status, setStatus] = useState<MotoristaStatusOperacional>(
    motorista.statusOperacional
  );
  const mutation = useUpdateMotoristaStatus();

  const handleConfirm = async () => {
    await mutation.mutateAsync(
      { id: motorista.id, statusOperacional: status },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("actions.updateStatus")}
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "motorista-status-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t("form.cancel")}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "motorista-status-confirm"}
            variant="primary"
            onClick={() => void handleConfirm()}
            isLoading={mutation.isPending}
            disabled={mutation.isPending}
            autoFocus
          >
            {t("form.submit")}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor="motorista-status-select"
          className="text-sm font-medium text-neutral-700"
        >
          {t("form.statusOperacional")}
        </label>
        <select
          id="motorista-status-select"
          data-testid={testId ? `${testId}-select` : "motorista-status-select"}
          value={status}
          onChange={(e) => setStatus(e.target.value as MotoristaStatusOperacional)}
          className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  );
}
