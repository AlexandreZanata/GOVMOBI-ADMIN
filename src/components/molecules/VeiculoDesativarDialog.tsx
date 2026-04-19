"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { useDesativarVeiculo } from "@/hooks/veiculos/useDesativarVeiculo";
import { useReativarVeiculo } from "@/hooks/veiculos/useReativarVeiculo";

export interface VeiculoDesativarDialogProps {
  open: boolean;
  onClose: () => void;
  veiculoId: string;
  veiculoPlaca: string;
  isActive: boolean;
  "data-testid"?: string;
}

/**
 * Confirmation dialog for soft-deactivating or reactivating a vehicle.
 */
export function VeiculoDesativarDialog({
  open,
  onClose,
  veiculoId,
  veiculoPlaca,
  isActive,
  "data-testid": testId,
}: VeiculoDesativarDialogProps): React.ReactElement | null {
  const { t } = useTranslation("veiculos");
  const headingId = useId();
  const desativarMutation = useDesativarVeiculo();
  const reativarMutation = useReativarVeiculo();
  const isPending = desativarMutation.isPending || reativarMutation.isPending;

  if (!open) return null;

  const handleConfirm = async () => {
    if (isActive) {
      await desativarMutation.mutateAsync({ id: veiculoId }, { onSuccess: onClose });
    } else {
      await reativarMutation.mutateAsync({ id: veiculoId }, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4" data-testid={testId}>
      <section role="dialog" aria-modal="true" aria-labelledby={headingId}
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm">
        <h2 id={headingId} className="text-base font-semibold text-neutral-900">
          {isActive ? t("actions.desativar") : t("actions.reativar")}
        </h2>
        <p className="mt-2 text-sm text-neutral-700">
          {t("delete.confirmation", { placa: veiculoPlaca })}
        </p>
        <p className="mt-1 text-xs text-neutral-500">{t("delete.reversible")}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} data-testid="veiculo-dialog-cancel">
            {t("form.cancel")}
          </Button>
          <Button
            variant={isActive ? "destructive" : "primary"}
            onClick={() => void handleConfirm()}
            isLoading={isPending}
            disabled={isPending}
            autoFocus
            data-testid="veiculo-dialog-confirm"
          >
            {isActive ? t("actions.desativar") : t("actions.reativar")}
          </Button>
        </div>
      </section>
    </div>
  );
}
