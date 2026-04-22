"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Car } from "lucide-react";

import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useAssociarVeiculo } from "@/hooks/motoristas/useAssociarVeiculo";
import { useDesassociarVeiculo } from "@/hooks/motoristas/useDesassociarVeiculo";
import { useVeiculos } from "@/hooks/veiculos/useVeiculos";
import type { Motorista } from "@/models/Motorista";

export interface MotoristaVeiculoDialogProps {
  open: boolean;
  onClose: () => void;
  motorista: Motorista;
  "data-testid"?: string;
}

/**
 * Dialog for associating or removing a vehicle from a motorista.
 * POST /frota/motoristas/{id}/veiculo
 * DELETE /frota/motoristas/{id}/veiculo
 */
export function MotoristaVeiculoDialog({
  open,
  onClose,
  motorista,
  "data-testid": testId,
}: MotoristaVeiculoDialogProps): React.ReactElement | null {
  const { t } = useTranslation("motoristas");
  const { data: veiculos = [], isLoading } = useVeiculos();
  const associarMutation = useAssociarVeiculo();
  const desassociarMutation = useDesassociarVeiculo();

  const [selectedVeiculoId, setSelectedVeiculoId] = useState(
    motorista.veiculoId ?? ""
  );

  const activeVeiculos = veiculos.filter((v) => v.ativo);
  const isPending = associarMutation.isPending || desassociarMutation.isPending;

  const hasCurrentVeiculo = !!motorista.veiculoId;
  const currentVeiculo = veiculos.find((v) => v.id === motorista.veiculoId);

  const handleAssociar = async (): Promise<void> => {
    if (!selectedVeiculoId) return;
    await associarMutation.mutateAsync(
      { motoristaId: motorista.id, veiculoId: selectedVeiculoId },
      { onSuccess: onClose }
    );
  };

  const handleDesassociar = async (): Promise<void> => {
    await desassociarMutation.mutateAsync(
      { motoristaId: motorista.id },
      { onSuccess: onClose }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("form.veiculo")}
      data-testid={testId}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {hasCurrentVeiculo && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                data-testid={testId ? `${testId}-desassociar` : "motorista-veiculo-desassociar"}
                onClick={() => void handleDesassociar()}
                isLoading={desassociarMutation.isPending}
                disabled={isPending}
              >
                {t("actions.desassociarVeiculo")}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("form.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              data-testid={testId ? `${testId}-associar` : "motorista-veiculo-associar"}
              onClick={() => void handleAssociar()}
              isLoading={associarMutation.isPending}
              disabled={isPending || !selectedVeiculoId}
            >
              {t("actions.associarVeiculo")}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Current vehicle */}
        {hasCurrentVeiculo && currentVeiculo && (
          <div className="flex items-center gap-3 rounded-xl border border-brand-primary/20 bg-brand-primary/5 px-4 py-3">
            <Car className="h-5 w-5 shrink-0 text-brand-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {currentVeiculo.placa} — {currentVeiculo.modelo}
              </p>
              <p className="text-xs text-neutral-500">{t("form.veiculoAtual")}</p>
            </div>
          </div>
        )}

        {/* Vehicle selector */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="motorista-veiculo-select"
            className="text-sm font-medium text-neutral-700"
          >
            {t("form.selecionarVeiculo")}
          </label>
          {isLoading ? (
            <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-200" />
          ) : (
            <select
              id="motorista-veiculo-select"
              data-testid={testId ? `${testId}-select` : "motorista-veiculo-select"}
              value={selectedVeiculoId}
              onChange={(e) => setSelectedVeiculoId(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            >
              <option value="">{t("form.veiculoPlaceholder")}</option>
              {activeVeiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.modelo} ({v.ano})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </Modal>
  );
}
