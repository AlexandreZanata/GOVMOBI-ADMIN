"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
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

export function VeiculoDesativarDialog({
  open,
  onClose,
  veiculoId,
  veiculoPlaca,
  isActive,
  "data-testid": testId,
}: VeiculoDesativarDialogProps): React.ReactElement | null {
  const { t } = useTranslation("veiculos");
  const desativarMutation = useDesativarVeiculo();
  const reativarMutation = useReativarVeiculo();
  const isPending = desativarMutation.isPending || reativarMutation.isPending;

  const handleConfirm = async () => {
    if (isActive) {
      await desativarMutation.mutateAsync({ id: veiculoId }, { onSuccess: onClose });
    } else {
      await reativarMutation.mutateAsync({ id: veiculoId }, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isActive ? t("actions.desativar") : t("actions.reativar")}
      maxWidth="max-w-md"
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            data-testid="veiculo-dialog-cancel"
          >
            {t("form.cancel")}
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isPending}
            autoFocus
            className={[
              "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "bg-danger hover:bg-danger/90 focus-visible:ring-danger"
                : "bg-brand-primary hover:opacity-90 focus-visible:ring-brand-primary",
            ].join(" ")}
            data-testid="veiculo-dialog-confirm"
          >
            {isPending ? "…" : isActive ? t("actions.desativar") : t("actions.reativar")}
          </button>
        </div>
      }
    >
      <p className="text-sm text-neutral-700">
        {t("delete.confirmation", { placa: veiculoPlaca })}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{t("delete.reversible")}</p>
    </Modal>
  );
}
