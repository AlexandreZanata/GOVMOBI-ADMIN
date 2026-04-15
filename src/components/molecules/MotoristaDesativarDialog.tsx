"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { useDesativarMotorista } from "@/hooks/motoristas/useDesativarMotorista";
import { useReativarMotorista } from "@/hooks/motoristas/useReativarMotorista";
import type { Motorista } from "@/models/Motorista";

/**
 * Props for the motorista desativar/reativar confirmation dialog.
 */
export interface MotoristaDesativarDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog should close. */
  onClose: () => void;
  /** Motorista to be deactivated or reactivated. */
  motorista: Motorista;
  /** Test selector prefix. */
  "data-testid"?: string;
}

/**
 * Confirmation dialog for soft-deactivating or reactivating a motorista.
 * Renders a destructive action when motorista is active, a reactivation
 * action when inactive. Closes on success.
 *
 * @param props - Dialog state, target motorista, and test selector
 * @returns Accessible confirmation dialog
 */
export function MotoristaDesativarDialog({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaDesativarDialogProps) {
  const { t } = useTranslation("motoristas");
  const headingId = useId();
  const desativarMutation = useDesativarMotorista();
  const reativarMutation = useReativarMotorista();

  if (!open) return null;

  const isActive = motorista.ativo;
  const isPending = desativarMutation.isPending || reativarMutation.isPending;

  const handleConfirm = async () => {
    if (isActive) {
      await desativarMutation.mutateAsync(
        { id: motorista.id },
        { onSuccess: onClose }
      );
    } else {
      await reativarMutation.mutateAsync(
        { id: motorista.id },
        { onSuccess: onClose }
      );
    }
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
          {isActive ? t("actions.desativar") : t("actions.reativar")}
        </h2>

        <p className="mt-2 text-sm text-neutral-700">{motorista.cnhNumero}</p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "motorista-desativar-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t("form.cancel")}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "motorista-desativar-confirm"}
            variant={isActive ? "destructive" : "ghost"}
            onClick={() => void handleConfirm()}
            isLoading={isPending}
            disabled={isPending}
            autoFocus
          >
            {isActive ? t("actions.desativar") : t("actions.reativar")}
          </Button>
        </div>
      </section>
    </div>
  );
}
