"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useDesativarMotorista } from "@/hooks/motoristas/useDesativarMotorista";
import { useReativarMotorista } from "@/hooks/motoristas/useReativarMotorista";
import type { Motorista } from "@/models/Motorista";

export interface MotoristaDesativarDialogProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista;
  "data-testid"?: string;
}

/**
 * Confirmation dialog for soft-deactivating or reactivating a motorista.
 */
export function MotoristaDesativarDialog({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaDesativarDialogProps) {
  const { t } = useTranslation("motoristas");
  const desativarMutation = useDesativarMotorista();
  const reativarMutation = useReativarMotorista();

  const isActive = motorista.ativo;
  const isPending = desativarMutation.isPending || reativarMutation.isPending;

  const handleConfirm = async () => {
    if (isActive) {
      await desativarMutation.mutateAsync({ id: motorista.id }, { onSuccess: onClose });
    } else {
      await reativarMutation.mutateAsync({ id: motorista.id }, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isActive ? t("actions.desativar") : t("actions.reativar")}
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            data-testid={testId ? `${testId}-cancel` : "motorista-desativar-cancel"}
            variant="ghost"
            onClick={onClose}
          >
            {t("form.cancel")}
          </Button>
          <Button
            data-testid={testId ? `${testId}-confirm` : "motorista-desativar-confirm"}
            variant={isActive ? "destructive" : "success"}
            onClick={() => void handleConfirm()}
            isLoading={isPending}
            disabled={isPending}
            autoFocus
          >
            {isActive ? t("actions.desativar") : t("actions.reativar")}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-neutral-700">
        {t(isActive ? "delete.confirmation" : "delete.reativarConfirmation", { cnhNumero: motorista.cnhNumero })}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{t("delete.reversible")}</p>
    </Modal>
  );
}
