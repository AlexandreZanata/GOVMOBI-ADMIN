"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Input } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useCreateVeiculo } from "@/hooks/veiculos/useCreateVeiculo";
import { useUpdateVeiculo } from "@/hooks/veiculos/useUpdateVeiculo";
import type { Veiculo } from "@/models/Veiculo";
import { ApiError } from "@/types";

export type VeiculoFormMode = "create" | "edit";

export interface VeiculoFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: VeiculoFormMode;
  veiculo?: Veiculo;
  "data-testid"?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

export function VeiculoFormDialog({
  open,
  onClose,
  mode,
  veiculo,
  "data-testid": testId,
}: VeiculoFormDialogProps): React.ReactElement | null {
  const { t } = useTranslation("veiculos");

  const [placa, setPlaca] = useState(veiculo?.placa ?? "");
  const [modelo, setModelo] = useState(veiculo?.modelo ?? "");
  const [ano, setAno] = useState(veiculo?.ano?.toString() ?? "");
  const [placaError, setPlacaError] = useState<string | undefined>();
  const [modeloError, setModeloError] = useState<string | undefined>();
  const [anoError, setAnoError] = useState<string | undefined>();

  const prevId = useRef(veiculo?.id);
  if (veiculo?.id !== prevId.current) {
    prevId.current = veiculo?.id;
    setPlaca(veiculo?.placa ?? "");
    setModelo(veiculo?.modelo ?? "");
    setAno(veiculo?.ano?.toString() ?? "");
    setPlacaError(undefined);
    setModeloError(undefined);
    setAnoError(undefined);
  }

  const createMutation = useCreateVeiculo();
  const updateMutation = useUpdateVeiculo();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset form fields — called on close and on successful create
  const resetForm = () => {
    setPlaca(""); setModelo(""); setAno("");
    setPlacaError(undefined); setModeloError(undefined); setAnoError(undefined);
  };

  const handleClose = () => {
    if (mode === "create") resetForm();
    onClose();
  };

  const validate = (): boolean => {
    let valid = true;
    if (!placa.trim()) { setPlacaError(t("form.placaRequired")); valid = false; } else { setPlacaError(undefined); }
    if (!modelo.trim()) { setModeloError(t("form.modeloRequired")); valid = false; } else { setModeloError(undefined); }
    const anoNum = Number(ano);
    if (!ano || isNaN(anoNum) || anoNum < 1900 || anoNum > CURRENT_YEAR + 1) {
      setAnoError(t("form.anoRequired")); valid = false;
    } else { setAnoError(undefined); }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (mode === "create") {
        await createMutation.mutateAsync({ placa: placa.trim().toUpperCase(), modelo: modelo.trim(), ano: Number(ano) });
      } else if (veiculo) {
        await updateMutation.mutateAsync({ id: veiculo.id, modelo: modelo.trim(), ano: Number(ano) });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setPlacaError(t("form.duplicatePlaca"));
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "create" ? t("form.titleCreate") : t("form.titleEdit")}
      maxWidth="max-w-2xl"
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            data-testid="veiculo-form-cancel"
          >
            {t("form.cancel")}
          </button>
          <button
            type="submit"
            form="veiculo-form"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50"
            data-testid="veiculo-form-submit"
          >
            {isPending ? "…" : t("form.submit")}
          </button>
        </div>
      }
    >
      <form id="veiculo-form" onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 sm:grid-cols-2" noValidate>
        {mode === "create" && (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Input
              label={t("form.placa")}
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              error={placaError}
              data-testid="veiculo-form-placa"
              aria-required="true"
              autoFocus
              maxLength={8}
            />
            <p className="text-xs text-neutral-500">{t("form.placaHint")}</p>
          </div>
        )}
        <Input
          label={t("form.modelo")}
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          error={modeloError}
          data-testid="veiculo-form-modelo"
          aria-required="true"
          autoFocus={mode === "edit"}
        />
        <Input
          label={t("form.ano")}
          type="number"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          error={anoError}
          data-testid="veiculo-form-ano"
          aria-required="true"
          min={1900}
          max={CURRENT_YEAR + 1}
        />
      </form>
    </Modal>
  );
}
