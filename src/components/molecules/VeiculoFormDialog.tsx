"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Button, Input } from "@/components/atoms";
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

/**
 * Modal form dialog for creating or editing a vehicle.
 * Closes on success; stays open and shows inline error on HTTP 409 (duplicate plate).
 */
export function VeiculoFormDialog({
  open,
  onClose,
  mode,
  veiculo,
  "data-testid": testId,
}: VeiculoFormDialogProps): React.ReactElement | null {
  const { t } = useTranslation("veiculos");
  const headingId = useId();

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

  useEffect(() => {
    if (open && mode === "create") {
      setPlaca(""); setModelo(""); setAno("");
      setPlacaError(undefined); setModeloError(undefined); setAnoError(undefined);
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const createMutation = useCreateVeiculo();
  const updateMutation = useUpdateVeiculo();
  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4" data-testid={testId}>
      <section role="dialog" aria-modal="true" aria-labelledby={headingId}
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm">
        <h2 id={headingId} className="text-base font-semibold text-neutral-900">
          {mode === "create" ? t("form.titleCreate") : t("form.titleEdit")}
        </h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4" noValidate>
          {mode === "create" && (
            <div className="flex flex-col gap-1">
              <Input label={t("form.placa")} value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                error={placaError} data-testid="veiculo-form-placa"
                aria-required="true" autoFocus maxLength={8} />
              <p className="text-xs text-neutral-500">{t("form.placaHint")}</p>
            </div>
          )}
          <Input label={t("form.modelo")} value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            error={modeloError} data-testid="veiculo-form-modelo"
            aria-required="true" autoFocus={mode === "edit"} />
          <Input label={t("form.ano")} type="number" value={ano}
            onChange={(e) => setAno(e.target.value)}
            error={anoError} data-testid="veiculo-form-ano"
            aria-required="true" min={1900} max={CURRENT_YEAR + 1} />
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} data-testid="veiculo-form-cancel">
              {t("form.cancel")}
            </Button>
            <Button type="submit" variant="primary" isLoading={isPending} disabled={isPending} data-testid="veiculo-form-submit">
              {t("form.submit")}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
