"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, UserPlus } from "lucide-react";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms";
import { useRegister } from "@/hooks/auth/useRegister";
import { useCargos } from "@/hooks/cargos/useCargos";
import { useLotacoes } from "@/hooks/useLotacoes";
import { formatCpf, unformatCpf, isValidCpfFormat } from "@/lib/cpfUtils";
import { formatPhone, unformatPhone } from "@/lib/phoneUtils";
import type { ApiError } from "@/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

type FieldName = "nome" | "cpf" | "email" | "telefone" | "cargoId" | "lotacaoId" | "senha" | "confirmSenha";
type FieldErrors = Partial<Record<FieldName, string>>;

const selectClass = (hasError: boolean) =>
  [
    "h-10 w-full rounded-lg border px-3 text-sm bg-white text-neutral-900",
    "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors",
    hasError
      ? "border-danger focus:ring-danger/20 focus:border-danger"
      : "border-neutral-200 focus:ring-brand-primary/20 focus:border-brand-primary",
  ].join(" ");

export function RegisterForm() {
  const { t } = useTranslation("auth");
  const { mutate, isPending, isSuccess, isError, error, reset } = useRegister();
  const { data: cargos } = useCargos();
  const { data: lotacoes } = useLotacoes();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargoId, setCargoId] = useState("");
  const [lotacaoId, setLotacaoId] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const activeCargos = cargos?.filter((c) => c.ativo) ?? [];
  const activeLotacoes = lotacoes?.filter((l) => l.ativo) ?? [];

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!nome.trim()) errors.nome = t("validation.nomeRequired");
    const rawCpf = unformatCpf(cpf);
    if (!rawCpf) errors.cpf = t("validation.cpfRequired");
    else if (!isValidCpfFormat(rawCpf)) errors.cpf = t("validation.cpfInvalid");
    if (!email.trim()) errors.email = t("validation.emailRequired");
    else if (!EMAIL_REGEX.test(email.trim())) errors.email = t("validation.emailInvalid");
    if (!telefone.trim()) errors.telefone = t("validation.telefoneRequired");
    if (!cargoId) errors.cargoId = t("validation.cargoRequired");
    if (!lotacaoId) errors.lotacaoId = t("validation.lotacaoRequired");
    if (!senha) errors.senha = t("validation.passwordRequired");
    else if (senha.length < MIN_PASSWORD_LENGTH) errors.senha = t("validation.passwordMinLength");
    if (!confirmSenha) errors.confirmSenha = t("validation.passwordRequired");
    else if (senha !== confirmSenha) errors.confirmSenha = t("validation.passwordMismatch");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function getApiFieldErrors(err: ApiError): FieldErrors {
    if (err.status === 409) return { cpf: t("errors.cpfAlreadyRegistered") };
    if (err.status === 422 && (err as ApiError & { field?: string }).field) {
      const field = (err as ApiError & { field?: string }).field as FieldName;
      return { [field]: err.message };
    }
    return {};
  }

  function getApiErrorMessage(err: ApiError): string | null {
    if (err.status === 409 || err.status === 422) return null;
    if (err.code === "NETWORK_ERROR") return t("errors.networkError");
    return t("errors.serverError");
  }

  function clearFieldError(field: FieldName) {
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSuccess) return;
    if (!validate()) return;
    reset();
    mutate(
      { nome: nome.trim(), cpf: unformatCpf(cpf), email: email.trim(), telefone: unformatPhone(telefone), cargoId, lotacaoId, senha },
      {
        onError: (err) => {
          const apiFieldErrors = getApiFieldErrors(err);
          if (Object.keys(apiFieldErrors).length > 0) {
            setFieldErrors((p) => ({ ...p, ...apiFieldErrors }));
          }
        },
      }
    );
  }

  const apiError = isError && error ? (error as ApiError) : null;
  const generalApiError = apiError ? getApiErrorMessage(apiError) : null;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {t("register.title")}
        </h1>
        <p className="text-sm text-neutral-500">
          {t("register.subtitle", { defaultValue: "Preencha os dados para solicitar acesso ao sistema." })}
        </p>
      </div>

      {/* Success state */}
      {isSuccess && (
        <div data-testid="success-message" role="status" className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-success">{t("register.successMessage")}</p>
            <p className="mt-0.5 text-xs text-success/80">Aguarde a ativação por um administrador.</p>
          </div>
        </div>
      )}

      {/* API error */}
      {generalApiError && (
        <div data-testid="error-message" role="alert" className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm text-danger">{generalApiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Personal info section */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Dados pessoais</p>

          <Input
            label={t("register.nomeLabel")}
            value={nome}
            onChange={(e) => { setNome(e.target.value); clearFieldError("nome"); }}
            data-testid="input-nome"
            error={fieldErrors.nome}
            id="register-nome"
            autoComplete="name"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("register.cpfLabel")}
              placeholder={t("register.cpfPlaceholder")}
              value={cpf}
              onChange={(e) => { setCpf(formatCpf(e.target.value)); clearFieldError("cpf"); }}
              data-testid="input-cpf"
              error={fieldErrors.cpf}
              id="register-cpf"
              inputMode="numeric"
              autoComplete="off"
            />
            <Input
              label={t("register.telefoneLabel")}
              placeholder={t("register.telefonePlaceholder")}
              value={telefone}
              onChange={(e) => { const d = e.target.value.replace(/\D/g, ""); setTelefone(formatPhone(d)); clearFieldError("telefone"); }}
              data-testid="input-telefone"
              error={fieldErrors.telefone}
              id="register-telefone"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>

          <Input
            label={t("register.emailLabel")}
            placeholder={t("register.emailPlaceholder")}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
            data-testid="input-email"
            error={fieldErrors.email}
            id="register-email"
            autoComplete="email"
          />
        </div>

        {/* Institutional info section */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Vínculo institucional</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Cargo */}
            <div className="flex flex-col gap-1">
              <label htmlFor="register-cargo" className="text-sm font-medium text-neutral-700">
                {t("register.cargoLabel")}
              </label>
              <select
                id="register-cargo"
                data-testid="select-cargo"
                value={cargoId}
                onChange={(e) => { setCargoId(e.target.value); clearFieldError("cargoId"); }}
                aria-invalid={!!fieldErrors.cargoId}
                className={selectClass(!!fieldErrors.cargoId)}
              >
                <option value="">{t("register.cargoPlaceholder")}</option>
                {activeCargos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              {fieldErrors.cargoId && <p role="alert" className="text-xs text-danger">{fieldErrors.cargoId}</p>}
            </div>

            {/* Lotação */}
            <div className="flex flex-col gap-1">
              <label htmlFor="register-lotacao" className="text-sm font-medium text-neutral-700">
                {t("register.lotacaoLabel")}
              </label>
              <select
                id="register-lotacao"
                data-testid="select-lotacao"
                value={lotacaoId}
                onChange={(e) => { setLotacaoId(e.target.value); clearFieldError("lotacaoId"); }}
                aria-invalid={!!fieldErrors.lotacaoId}
                className={selectClass(!!fieldErrors.lotacaoId)}
              >
                <option value="">{t("register.lotacaoPlaceholder")}</option>
                {activeLotacoes.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
              {fieldErrors.lotacaoId && <p role="alert" className="text-xs text-danger">{fieldErrors.lotacaoId}</p>}
            </div>
          </div>
        </div>

        {/* Password section */}
        <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Segurança</p>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t("register.passwordLabel")}
              placeholder={t("register.passwordPlaceholder")}
              type="password"
              value={senha}
              onChange={(e) => { setSenha(e.target.value); clearFieldError("senha"); }}
              data-testid="input-senha"
              error={fieldErrors.senha}
              id="register-senha"
              autoComplete="new-password"
            />
            <Input
              label={t("register.confirmPasswordLabel")}
              placeholder={t("register.confirmPasswordPlaceholder")}
              type="password"
              value={confirmSenha}
              onChange={(e) => { setConfirmSenha(e.target.value); clearFieldError("confirmSenha"); }}
              data-testid="input-confirm-senha"
              error={fieldErrors.confirmSenha}
              id="register-confirm-senha"
              autoComplete="new-password"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          aria-busy={isPending}
          disabled={isSuccess}
          data-testid="button-register"
          className="w-full"
        >
          {!isPending && <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />}
          {t("register.submitButton")}
        </Button>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-neutral-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-brand-primary hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
