"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Modal } from "@/components/molecules/Modal";
import type { Veiculo } from "@/models/Veiculo";

export interface VeiculoViewModalProps {
  open: boolean;
  onClose: () => void;
  veiculo: Veiculo | undefined;
  "data-testid"?: string;
}

export function VeiculoViewModal({
  open,
  onClose,
  veiculo,
  "data-testid": testId,
}: VeiculoViewModalProps): React.ReactElement | null {
  const { t } = useTranslation("veiculos");

  if (!veiculo) return null;

  const safeFormatDate = (iso: string | null): string => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${veiculo.placa} — ${veiculo.modelo}`}
      maxWidth="max-w-4xl"
      data-testid={testId}
    >
      <div className="space-y-6">
        {/* Status badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
              veiculo.ativo
                ? "bg-success/10 text-success ring-success/20"
                : "bg-neutral-100 text-neutral-500 ring-neutral-200",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "h-1.5 w-1.5 rounded-full",
                veiculo.ativo ? "bg-success" : "bg-neutral-400",
              ].join(" ")}
            />
            {veiculo.ativo ? t("status.active") : t("status.inactive")}
          </span>
        </div>

        {/* Dados do Veículo */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">
            {t("view.dadosVeiculo")}
          </h3>
          <div className="rounded-xl border border-neutral-100 bg-white p-5">
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-neutral-900">{t("table.placa")}</dt>
                <dd className="break-all text-sm text-neutral-400">{veiculo.placa}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-neutral-900">{t("table.modelo")}</dt>
                <dd className="break-all text-sm text-neutral-400">{veiculo.modelo}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-neutral-900">{t("table.ano")}</dt>
                <dd className="break-all text-sm text-neutral-400">{veiculo.ano}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Identificação */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">
            {t("view.identificacao")}
          </h3>
          <div className="rounded-xl border border-neutral-100 bg-white p-5">
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold text-neutral-900">ID</dt>
              <dd className="break-all text-sm text-neutral-400">{veiculo.id}</dd>
            </div>
          </div>
        </div>

        {/* Auditoria */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">
            {t("view.auditoria")}
          </h3>
          <div className="rounded-xl border border-neutral-100 bg-white p-5">
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-neutral-900">{t("view.criadoEm")}</dt>
                <dd className="break-all text-sm text-neutral-400">{safeFormatDate(veiculo.createdAt)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-neutral-900">{t("view.atualizadoEm")}</dt>
                <dd className="break-all text-sm text-neutral-400">{safeFormatDate(veiculo.updatedAt)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold text-neutral-900">{t("view.excluidoEm")}</dt>
                <dd className="break-all text-sm text-neutral-400">{safeFormatDate(veiculo.deletedAt)}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
