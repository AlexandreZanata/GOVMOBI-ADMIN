"use client";

import React, { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AlertCircle, Clock } from "lucide-react";
import "@/i18n/config";

import { Input } from "@/components/atoms";
import { useLogin } from "@/hooks/auth/useLogin";
import { formatCpf, unformatCpf, isValidCpfFormat } from "@/lib/cpfUtils";
import type { ApiError } from "@/types";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const searchParams = useSearchParams();
  const { mutate, isPending, isError, error } = useLogin();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ cpf?: string; password?: string }>({});

  const isSessionExpired = searchParams.get("reason") === "session_expired";

  function validate(): boolean {
    const errors: { cpf?: string; password?: string } = {};
    const rawCpf = unformatCpf(cpf);
    if (!rawCpf) errors.cpf = t("validation.cpfRequired");
    else if (!isValidCpfFormat(rawCpf)) errors.cpf = t("validation.cpfInvalid");
    if (!password) errors.password = t("validation.passwordRequired");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function getApiErrorMessage(err: ApiError): string {
    switch (err.status) {
      case 401: return t("errors.invalidCredentials");
      case 429: return t("errors.tooManyAttempts");
      case 500: return t("errors.serverError");
      default:
        if (err.code === "NETWORK_ERROR") return t("errors.networkError");
        if (err.message && err.message !== "REQUEST_FAILED") return err.message;
        return t("errors.serverError");
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutate({ cpf: unformatCpf(cpf), senha: password });
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900">
        {t("login.title")}
      </h1>

      {/* Banners */}
      {isSessionExpired && (
        <div role="status" className="flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/5 px-3.5 py-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-sm text-warning">{t("session.expired")}</p>
        </div>
      )}

      {isError && error && (
        <div data-testid="error-message" role="alert" className="flex items-start gap-2.5 rounded-lg border border-danger/20 bg-danger/5 px-3.5 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm text-danger">{getApiErrorMessage(error as ApiError)}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label={t("login.cpfLabel")}
          placeholder={t("login.cpfPlaceholder")}
          value={cpf}
          onChange={(e) => {
            setCpf(formatCpf(e.target.value));
            if (fieldErrors.cpf) setFieldErrors((p) => ({ ...p, cpf: undefined }));
          }}
          autoComplete="username"
          data-testid="input-cpf"
          error={fieldErrors.cpf}
          id="login-cpf"
          inputMode="numeric"
        />

        <Input
          label={t("login.passwordLabel")}
          placeholder={t("login.passwordPlaceholder")}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          autoComplete="current-password"
          data-testid="input-password"
          error={fieldErrors.password}
          id="login-password"
        />

        <button
          type="submit"
          disabled={isPending}
          data-testid="button-login"
          aria-busy={isPending}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            t("login.submitButton")
          )}
        </button>
      </form>
    </div>
  );
}
