"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { LocationPicker } from "@/components/molecules/LocationPicker";
import { Modal } from "@/components/molecules/Modal";
import { ServidorPicker } from "@/components/molecules/ServidorPicker";
import { useCreateAdminRun } from "@/hooks/runs/useCreateAdminRun";
import { usePesquisaConfig } from "@/hooks/pesquisa/usePesquisaConfig";
import type { LocationValue } from "@/components/molecules/LocationPicker";

export interface RunCreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  "data-testid"?: string;
}

/**
 * Admin dialog for creating a corrida on behalf of a servidor.
 * POST /admin/corridas
 * Uses LocationPicker for origin/destination instead of raw lat/lng inputs.
 */
export function RunCreateAdminDialog({
  open,
  onClose,
  "data-testid": testId,
}: RunCreateAdminDialogProps): React.ReactElement | null {
  const { t } = useTranslation("runs");
  const createMutation = useCreateAdminRun();
  const { data: pesquisaConfig } = usePesquisaConfig();

  // Use municipality coordinates as proximity bias for geocoding
  const proximity = pesquisaConfig?.municipioLat && pesquisaConfig?.municipioLng
    ? { lat: pesquisaConfig.municipioLat, lng: pesquisaConfig.municipioLng }
    : undefined;

  const [passageiroId, setPassageiroId] = useState("");
  const [origem, setOrigem] = useState<LocationValue | null>(null);
  const [destino, setDestino] = useState<LocationValue | null>(null);
  const [motivoServico, setMotivoServico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setPassageiroId("");
    setOrigem(null);
    setDestino(null);
    setMotivoServico("");
    setObservacoes("");
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!passageiroId.trim()) errs.passageiroId = t("dialogs.createRun.passageiroIdRequired");
    if (!origem) errs.origem = t("dialogs.createRun.origemRequired");
    if (!destino) errs.destino = t("dialogs.createRun.destinoRequired");
    if (!motivoServico.trim()) errs.motivoServico = t("dialogs.createRun.motivoServicoRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate() || !origem || !destino) return;
    await createMutation.mutateAsync(
      {
        passageiroId: passageiroId.trim(),
        origemLat: origem.lat,
        origemLng: origem.lng,
        destinoLat: destino.lat,
        destinoLng: destino.lng,
        motivoServico: motivoServico.trim(),
        observacoes: observacoes.trim() || undefined,
      },
      { onSuccess: () => { reset(); onClose(); } },
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={t("dialogs.createRun.title")}
      maxWidth="max-w-2xl"
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            data-testid={testId ? `${testId}-cancel` : "run-create-admin-cancel"}
            onClick={() => { reset(); onClose(); }}
          >
            {t("dialogs.createRun.cancel")}
          </Button>
          <Button
            type="submit"
            form="run-create-admin-form"
            variant="primary"
            data-testid={testId ? `${testId}-submit` : "run-create-admin-submit"}
            isLoading={createMutation.isPending}
            disabled={createMutation.isPending}
          >
            {t("dialogs.createRun.confirm")}
          </Button>
        </div>
      }
    >
      <form
        id="run-create-admin-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Passageiro */}
        <ServidorPicker
          data-testid={testId ? `${testId}-passageiroId` : "run-create-admin-passageiroId"}
          label={t("dialogs.createRun.passageiroId")}
          value={passageiroId}
          onChange={setPassageiroId}
          error={errors.passageiroId}
          required
        />

        {/* Origem */}
        <LocationPicker
          data-testid={testId ? `${testId}-origem` : "run-create-admin-origem"}
          label={t("dialogs.createRun.origem")}
          value={origem}
          onChange={setOrigem}
          error={errors.origem}
          proximity={proximity}
          required
        />

        {/* Destino */}
        <LocationPicker
          data-testid={testId ? `${testId}-destino` : "run-create-admin-destino"}
          label={t("dialogs.createRun.destino")}
          value={destino}
          onChange={setDestino}
          error={errors.destino}
          proximity={proximity}
          required
        />

        {/* Motivo */}
        <Input
          data-testid={testId ? `${testId}-motivoServico` : "run-create-admin-motivoServico"}
          label={t("dialogs.createRun.motivoServico")}
          value={motivoServico}
          onChange={(e) => setMotivoServico(e.target.value)}
          error={errors.motivoServico}
          aria-required="true"
        />

        {/* Observações */}
        <Input
          data-testid={testId ? `${testId}-observacoes` : "run-create-admin-observacoes"}
          label={t("dialogs.createRun.observacoes")}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </form>
    </Modal>
  );
}
