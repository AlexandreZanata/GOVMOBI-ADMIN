"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Button } from "@/components/atoms";
import { Input } from "@/components/atoms";
import { useRegister } from "@/hooks/auth/useRegister";
import { useCargos } from "@/hooks/cargos/useCargos";
import { useLotacoes } from "@/hooks/useLotacoes";
import { formatCpf, unformatCpf, isValidCpfFormat } from "@/lib/cpfUtils";
import { formatPhone, unformatPhone } from "@/lib/phoneUtils";
import type { ApiError } from "@/types";

/** Email validation regex — basic RFC-compliant check. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimum password length required for registration. */
const MIN_PASSWORD_LENGTH = 8;

/** Field names used for validation error tracking. */
type FieldName =
  | "nome"
  | "cpf"
  | "email"
  | "telefone"
  | "cargoId"
  | "lotacaoId"
  | "senha"
  | "confirmSenha";

type FieldErrors = Partial<Record<FieldName, string>>;

/**
 * Registration form organism for self-registering new servidores.
 *
 * Renders a self-contained registration form with CPF masking, phone masking,
 * cargo/lotação selects populated from API data, client-side validation,
 * API error display, and a success message on 201. Uses the `useRegister`
 * mutation hook and populates selects via `useCargos` and `useLotacoes`.
 *
 * @returns The registration form with all required fields, validation,
 *          error handling, and a link to the login page.
 */
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

  /**
   * Validates all form fields and returns true if the form is valid.
   */
  function validate(): boolean {
    const errors: FieldErrors = {};

    if (!nome.trim()) {
      errors.nome = t("validation.nomeRequired");
    }

    const rawCpf = unformatCpf(cpf);
    if (!rawCpf) {
      errors.cpf = t("validation.cpfRequired");
    } else if (!isValidCpfFormat(rawCpf)) {
      errors.cpf = t("validation.cpfInvalid");
    }

    if (!email.trim()) {
      errors.email = t("validation.emailRequired");
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = t("validation.emailInvalid");
    }

    if (!telefone.trim()) {
      errors.telefone = t("validation.telefoneRequired");
    }

    if (!cargoId) {
      errors.cargoId = t("validation.cargoRequired");
    }

    if (!lotacaoId) {
      errors.lotacaoId = t("validation.lotacaoRequired");
    }

    if (!senha) {
      errors.senha = t("validation.passwordRequired");
    } else if (senha.length < MIN_PASSWORD_LENGTH) {
      errors.senha = t("validation.passwordMinLength");
    }

    if (!confirmSenha) {
      errors.confirmSenha = t("validation.passwordRequired");
    } else if (senha !== confirmSenha) {
      errors.confirmSenha = t("validation.passwordMismatch");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Maps API error responses to inline field errors or a general message.
   * - 409 → CPF already registered (inline on CPF field)
   * - 422 → map error.field to the corresponding form field
   */
  function getApiFieldErrors(err: ApiError): FieldErrors {
    if (err.status === 409) {
      return { cpf: t("errors.cpfAlreadyRegistered") };
    }

    if (err.status === 422 && (err as ApiError & { field?: string }).field) {
      const field = (err as ApiError & { field?: string }).field as FieldName;
      return { [field]: err.message };
    }

    return {};
  }

  /**
   * Returns a general API error message for non-field-specific errors.
   */
  function getApiErrorMessage(err: ApiError): string | null {
    if (err.status === 409 || err.status === 422) {
      return null; // Handled as inline field errors
    }
    if (err.code === "NETWORK_ERROR") {
      return t("errors.networkError");
    }
    return t("errors.serverError");
  }

  function clearFieldError(field: FieldName) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
    clearFieldError("cpf");
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    const formatted = formatPhone(digits);
    setTelefone(formatted);
    clearFieldError("telefone");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSuccess) return;
    if (!validate()) return;

    reset();
    mutate(
      {
        nome: nome.trim(),
        cpf: unformatCpf(cpf),
        email: email.trim(),
        telefone: unformatPhone(telefone),
        cargoId,
        lotacaoId,
        senha,
      },
      {
        onError: (err) => {
          const apiFieldErrors = getApiFieldErrors(err);
          if (Object.keys(apiFieldErrors).length > 0) {
            setFieldErrors((prev) => ({ ...prev, ...apiFieldErrors }));
          }
        },
      }
    );
  }

  const apiError = isError && error ? error as ApiError : null;
  const generalApiError = apiError ? getApiErrorMessage(apiError) : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-neutral-900">
        {t("register.title")}
      </h1>

      {isSuccess && (
        <div
          data-testid="success-message"
          role="status"
          className="rounded-md bg-green-50 p-3 text-sm text-green-800"
        >
          {t("register.successMessage")}
        </div>
      )}

      {generalApiError && (
        <div
          data-testid="error-message"
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-danger"
        >
          {generalApiError}
        </div>
      )}

      <Input
        label={t("register.nomeLabel")}
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          clearFieldError("nome");
        }}
        data-testid="input-nome"
        error={fieldErrors.nome}
        id="register-nome"
        autoComplete="name"
      />

      <Input
        label={t("register.cpfLabel")}
        placeholder={t("register.cpfPlaceholder")}
        value={cpf}
        onChange={handleCpfChange}
        data-testid="input-cpf"
        error={fieldErrors.cpf}
        id="register-cpf"
        inputMode="numeric"
        autoComplete="off"
      />

      <Input
        label={t("register.emailLabel")}
        placeholder={t("register.emailPlaceholder")}
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          clearFieldError("email");
        }}
        data-testid="input-email"
        error={fieldErrors.email}
        id="register-email"
        autoComplete="email"
      />

      <Input
        label={t("register.telefoneLabel")}
        placeholder={t("register.telefonePlaceholder")}
        value={telefone}
        onChange={handlePhoneChange}
        data-testid="input-telefone"
        error={fieldErrors.telefone}
        id="register-telefone"
        inputMode="tel"
        autoComplete="tel"
      />

      {/* Cargo select */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-cargo"
          className="text-sm font-medium text-neutral-700"
        >
          {t("register.cargoLabel")}
        </label>
        <select
          id="register-cargo"
          data-testid="select-cargo"
          value={cargoId}
          onChange={(e) => {
            setCargoId(e.target.value);
            clearFieldError("cargoId");
          }}
          aria-invalid={!!fieldErrors.cargoId}
          aria-describedby={fieldErrors.cargoId ? "register-cargo-error" : undefined}
          className={[
            "h-10 w-full rounded-md border px-3 text-sm",
            "bg-white text-neutral-900",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            fieldErrors.cargoId
              ? "border-danger focus:ring-danger"
              : "border-neutral-300 focus:ring-brand-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          <option value="">{t("register.cargoPlaceholder")}</option>
          {activeCargos.map((cargo) => (
            <option key={cargo.id} value={cargo.id}>
              {cargo.nome}
            </option>
          ))}
        </select>
        {fieldErrors.cargoId && (
          <p id="register-cargo-error" role="alert" className="text-xs text-danger">
            {fieldErrors.cargoId}
          </p>
        )}
      </div>

      {/* Lotação select */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-lotacao"
          className="text-sm font-medium text-neutral-700"
        >
          {t("register.lotacaoLabel")}
        </label>
        <select
          id="register-lotacao"
          data-testid="select-lotacao"
          value={lotacaoId}
          onChange={(e) => {
            setLotacaoId(e.target.value);
            clearFieldError("lotacaoId");
          }}
          aria-invalid={!!fieldErrors.lotacaoId}
          aria-describedby={fieldErrors.lotacaoId ? "register-lotacao-error" : undefined}
          className={[
            "h-10 w-full rounded-md border px-3 text-sm",
            "bg-white text-neutral-900",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            fieldErrors.lotacaoId
              ? "border-danger focus:ring-danger"
              : "border-neutral-300 focus:ring-brand-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          <option value="">{t("register.lotacaoPlaceholder")}</option>
          {activeLotacoes.map((lotacao) => (
            <option key={lotacao.id} value={lotacao.id}>
              {lotacao.nome}
            </option>
          ))}
        </select>
        {fieldErrors.lotacaoId && (
          <p id="register-lotacao-error" role="alert" className="text-xs text-danger">
            {fieldErrors.lotacaoId}
          </p>
        )}
      </div>

      <Input
        label={t("register.passwordLabel")}
        placeholder={t("register.passwordPlaceholder")}
        type="password"
        value={senha}
        onChange={(e) => {
          setSenha(e.target.value);
          clearFieldError("senha");
        }}
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
        onChange={(e) => {
          setConfirmSenha(e.target.value);
          clearFieldError("confirmSenha");
        }}
        data-testid="input-confirm-senha"
        error={fieldErrors.confirmSenha}
        id="register-confirm-senha"
        autoComplete="new-password"
      />

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
        {t("register.submitButton")}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link
          href="/login"
          className="text-brand-primary underline hover:opacity-80"
        >
          {t("register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
