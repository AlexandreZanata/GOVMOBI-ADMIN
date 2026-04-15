"use client";

import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { useUpdateMotoristaStatus } from "@/hooks/motoristas/useUpdateMotoristaStatus";
import type { Motorista, MotoristaStatusOperacional } from "@/models/Motorista";

/** Available operational status options. */
const STATUS_OPTIONS: MotoristaStatusOperacional[] = [
  "DISPONIVEL",
  "EM_SERVICO",
  "INDISPONIVEL",
  "AFASTADO",
];

/**
 * Props for the motorista operational status update dialog.
 */
export interface MotoristaStatusDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Motorista whose status will be updated. */
  motorista: Motorista;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Dialog for updating a motorista's operational status.
 * Calls useUpdateMotoristaStatus on confirm; closes on success.
 *
 * @param props - Dialog state, target motorista, and test selector
 * @returns Accessible status selection dialog
 */
export function MotoristaStatusDialog({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaStatusDialogProps) {
  const { t } = useTranslation("motoristas");
  const headingId = useId();
  const [status, setStatus] = useState<MotoristaStatusOperacional>(
    motorista.statusOperacional
  );
  const mutation = useUpdateMotoristaStatus();

  if (!open) return null;

  const handleConfirm = async () => {
    await mutation.mutateAsync(
      { id: motorista.id, statusOperacional: status },
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
        className="w-full max-w-sm rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2 id={headingId} className="text-base font-semibold text-neutral-900">
          {t("actions.updateStatus")}
        </h2>

        <div className="mt-4 flex flex-col gap-1">
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
            onChange={(e) =>
              setStatus(e.target.value as MotoristaStatusOperacional)
            }
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
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
      </section>
    </div>
  );
}
