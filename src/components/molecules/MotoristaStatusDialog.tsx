"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useUpdateMotoristaStatus } from "@/hooks/motoristas/useUpdateMotoristaStatus";
import type { Motorista } from "@/models/Motorista";
import { StatusOperacional } from "@/models";

// Only DISPONIVEL and OFFLINE are admin-settable.
// EM_CORRIDA is managed exclusively by the system.
const STATUS_OPTIONS: StatusOperacional[] = [
  StatusOperacional.DISPONIVEL,
  StatusOperacional.OFFLINE,
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
  const [status, setStatus] = useState<StatusOperacional>(
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
            disabled={mutation.isPending || motorista.statusOperacional === StatusOperacional.EM_CORRIDA}
            autoFocus
          >
            {t("form.submit")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {motorista.statusOperacional === StatusOperacional.EM_CORRIDA && (
          <div className="flex items-start gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-warning" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-warning">
              Este motorista está em corrida. O status <strong>Em corrida</strong> é gerenciado exclusivamente pelo sistema e não pode ser alterado manualmente.
            </p>
          </div>
        )}
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
            onChange={(e) => setStatus(e.target.value as StatusOperacional)}
            disabled={motorista.statusOperacional === StatusOperacional.EM_CORRIDA}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
            {/* Show current value if it's EM_CORRIDA (read-only) */}
            {motorista.statusOperacional === StatusOperacional.EM_CORRIDA && (
              <option value={StatusOperacional.EM_CORRIDA}>{t("status.EM_CORRIDA")}</option>
            )}
          </select>
        </div>
      </div>
    </Modal>
  );
}
