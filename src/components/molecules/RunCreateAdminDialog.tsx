"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { useCreateAdminRun } from "@/hooks/runs/useCreateAdminRun";

export interface RunCreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  "data-testid"?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Admin dialog for creating a corrida on behalf of a servidor.
 * POST /admin/corridas
 */
export function RunCreateAdminDialog({
  open,
  onClose,
  "data-testid": testId,
}: RunCreateAdminDialogProps): React.ReactElement | null {
  const { t } = useTranslation("runs");
  const createMutation = useCreateAdminRun();

  const [passageiroId, setPassageiroId] = useState("");
  const [origemLat, setOrigemLat] = useState("");
  const [origemLng, setOrigemLng] = useState("");
  const [destinoLat, setDestinoLat] = useState("");
  const [destinoLng, setDestinoLng] = useState("");
  const [motivoServico, setMotivoServico] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setPassageiroId(""); setOrigemLat(""); setOrigemLng("");
    setDestinoLat(""); setDestinoLng(""); setMotivoServico(""); setObservacoes("");
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!UUID_RE.test(passageiroId.trim())) errs.passageiroId = t("dialogs.createRun.passageiroIdInvalid");
    if (!origemLat.trim() || isNaN(Number(origemLat))) errs.origemLat = t("dialogs.createRun.origemLatRequired");
    if (!origemLng.trim() || isNaN(Number(origemLng))) errs.origemLng = t("dialogs.createRun.origemLngRequired");
    if (!destinoLat.trim() || isNaN(Number(destinoLat))) errs.destinoLat = t("dialogs.createRun.destinoLatRequired");
    if (!destinoLng.trim() || isNaN(Number(destinoLng))) errs.destinoLng = t("dialogs.createRun.destinoLngRequired");
    if (!motivoServico.trim()) errs.motivoServico = t("dialogs.createRun.motivoServicoRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;
    await createMutation.mutateAsync(
      {
        passageiroId: passageiroId.trim(),
        origemLat: Number(origemLat),
        origemLng: Number(origemLng),
        destinoLat: Number(destinoLat),
        destinoLng: Number(destinoLng),
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
        className="grid gap-4 sm:grid-cols-2"
        noValidate
      >
        <div className="sm:col-span-2">
          <Input
            data-testid={testId ? `${testId}-passageiroId` : "run-create-admin-passageiroId"}
            label={t("dialogs.createRun.passageiroId")}
            value={passageiroId}
            onChange={(e) => setPassageiroId(e.target.value)}
            error={errors.passageiroId}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            aria-required="true"
            autoFocus
          />
        </div>
        <Input
          data-testid={testId ? `${testId}-origemLat` : "run-create-admin-origemLat"}
          label={t("dialogs.createRun.origemLat")}
          type="number"
          value={origemLat}
          onChange={(e) => setOrigemLat(e.target.value)}
          error={errors.origemLat}
          aria-required="true"
        />
        <Input
          data-testid={testId ? `${testId}-origemLng` : "run-create-admin-origemLng"}
          label={t("dialogs.createRun.origemLng")}
          type="number"
          value={origemLng}
          onChange={(e) => setOrigemLng(e.target.value)}
          error={errors.origemLng}
          aria-required="true"
        />
        <Input
          data-testid={testId ? `${testId}-destinoLat` : "run-create-admin-destinoLat"}
          label={t("dialogs.createRun.destinoLat")}
          type="number"
          value={destinoLat}
          onChange={(e) => setDestinoLat(e.target.value)}
          error={errors.destinoLat}
          aria-required="true"
        />
        <Input
          data-testid={testId ? `${testId}-destinoLng` : "run-create-admin-destinoLng"}
          label={t("dialogs.createRun.destinoLng")}
          type="number"
          value={destinoLng}
          onChange={(e) => setDestinoLng(e.target.value)}
          error={errors.destinoLng}
          aria-required="true"
        />
        <div className="sm:col-span-2">
          <Input
            data-testid={testId ? `${testId}-motivoServico` : "run-create-admin-motivoServico"}
            label={t("dialogs.createRun.motivoServico")}
            value={motivoServico}
            onChange={(e) => setMotivoServico(e.target.value)}
            error={errors.motivoServico}
            aria-required="true"
          />
        </div>
        <div className="sm:col-span-2">
          <Input
            data-testid={testId ? `${testId}-observacoes` : "run-create-admin-observacoes"}
            label={t("dialogs.createRun.observacoes")}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
