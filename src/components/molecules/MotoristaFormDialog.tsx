"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, Input } from "@/components/atoms";
import { Modal } from "@/components/molecules/Modal";
import { ServidorPicker } from "@/components/molecules/ServidorPicker";
import { useCreateMotorista } from "@/hooks/motoristas/useCreateMotorista";
import { useUpdateMotorista } from "@/hooks/motoristas/useUpdateMotorista";
import type { CnhCategoria, Motorista } from "@/models/Motorista";
import { ApiError } from "@/types";

export type MotoristaFormMode = "create" | "edit";

const CNH_OPTIONS: CnhCategoria[] = ["A", "B", "AB", "C", "D", "E"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface MotoristaFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: MotoristaFormMode;
  motorista?: Motorista;
  "data-testid"?: string;
}

/**
 * Modal form dialog for registering a new motorista or editing CNH data.
 * Create mode: servidorId, municipioId, cnhNumero, cnhCategoria.
 * Edit mode: cnhNumero and cnhCategoria only.
 */
export function MotoristaFormDialog({
  open,
  onClose,
  mode,
  motorista,
  "data-testid": testId,
}: MotoristaFormDialogProps) {
  const { t } = useTranslation("motoristas");

  const [servidorId, setServidorId] = useState(motorista?.servidorId ?? "");
  const [municipioId, setMunicipioId] = useState("");
  const [cnhNumero, setCnhNumero] = useState(motorista?.cnhNumero ?? "");
  const [cnhCategoria, setCnhCategoria] = useState<CnhCategoria>(motorista?.cnhCategoria ?? "B");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inlineError, setInlineError] = useState<string | undefined>();

  const createMutation = useCreateMotorista();
  const updateMutation = useUpdateMotorista();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const prevId = useRef(motorista?.id);
  if (motorista?.id !== prevId.current) {
    prevId.current = motorista?.id;
    setServidorId(motorista?.servidorId ?? "");
    setCnhNumero(motorista?.cnhNumero ?? "");
    setCnhCategoria(motorista?.cnhCategoria ?? "B");
    setErrors({});
    setInlineError(undefined);
  }

  // Reset form when dialog opens in create mode — called on close and on successful create
  const resetForm = () => {
    setServidorId(""); setMunicipioId(""); setCnhNumero(""); setCnhCategoria("B");
    setErrors({}); setInlineError(undefined);
  };

  const handleClose = () => {
    if (mode === "create") resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "create") {
      if (!servidorId.trim()) errs.servidorId = t("form.servidorIdRequired");
      if (!UUID_RE.test(municipioId.trim())) errs.municipioId = t("form.municipioIdInvalid");
    }
    if (!cnhNumero.trim()) errs.cnhNumero = t("form.cnhNumeroRequired");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(undefined);
    if (!validate()) return;

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(
          { servidorId: servidorId.trim(), municipioId: municipioId.trim(), cnhNumero: cnhNumero.trim(), cnhCategoria },
          { onSuccess: handleClose }
        );
      } else if (motorista) {
        await updateMutation.mutateAsync(
          { id: motorista.id, cnhNumero: cnhNumero.trim(), cnhCategoria },
          { onSuccess: handleClose }
        );
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setInlineError(t("toast.duplicateCnh"));
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "create" ? t("actions.create") : t("actions.edit")}
      maxWidth="max-w-lg"
      data-testid={testId}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose} data-testid="motorista-form-cancel">
            {t("form.cancel")}
          </Button>
          <Button
            type="submit"
            form="motorista-form"
            variant="primary"
            isLoading={isPending}
            disabled={isPending}
            data-testid="motorista-form-submit"
          >
            {t("form.submit")}
          </Button>
        </div>
      }
    >
      {inlineError && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
          <p role="alert" className="text-sm text-danger">{inlineError}</p>
        </div>
      )}

      <form
        id="motorista-form"
        data-testid={testId ? `${testId}-form` : "motorista-form"}
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4"
        noValidate
      >
        {mode === "create" && (
          <>
            <ServidorPicker
              data-testid="motorista-form-servidorId"
              label={t("form.servidorId")}
              value={servidorId}
              onChange={setServidorId}
              error={errors.servidorId}
              required
            />
            <Input
              data-testid="motorista-form-municipioId"
              label={t("form.municipioId")}
              placeholder="UUID do município"
              value={municipioId}
              onChange={(e) => setMunicipioId(e.target.value)}
              error={errors.municipioId}
              aria-required="true"
            />
          </>
        )}

        <Input
          data-testid="motorista-form-cnhNumero"
          label={t("form.cnhNumero")}
          value={cnhNumero}
          onChange={(e) => setCnhNumero(e.target.value)}
          error={errors.cnhNumero}
          aria-required="true"
          autoFocus={mode === "edit"}
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="motorista-form-cnhCategoria" className="text-sm font-medium text-neutral-700">
            {t("form.cnhCategoria")}
          </label>
          <select
            id="motorista-form-cnhCategoria"
            data-testid="motorista-form-cnhCategoria"
            value={cnhCategoria}
            onChange={(e) => setCnhCategoria(e.target.value as CnhCategoria)}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            {CNH_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
