"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AlertCircle, Clock, LogIn } from "lucide-react";
import "@/i18n/config";

import { Button } from "@/components/atoms";
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

  function handleCpfChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCpf(e.target.value));
    if (fieldErrors.cpf) setFieldErrors((p) => ({ ...p, cpf: undefined }));
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutate({ cpf: unformatCpf(cpf), senha: password });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          {t("login.title")}
        </h1>
        <p className="text-sm text-neutral-500">
          {t("login.subtitle", { defaultValue: "Acesse o painel de gestão com suas credenciais." })}
        </p>
      </div>

      {/* Session expired banner */}
      {isSessionExpired && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-sm text-warning">{t("session.expired")}</p>
        </div>
      )}

      {/* API error banner */}
      {isError && error && (
        <div data-testid="error-message" role="alert" className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
          <p className="text-sm text-danger">{getApiErrorMessage(error as ApiError)}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label={t("login.cpfLabel")}
          placeholder={t("login.cpfPlaceholder")}
          value={cpf}
          onChange={handleCpfChange}
          autoComplete="username"
          data-testid="input-cpf"
          error={fieldErrors.cpf}
          id="login-cpf"
          inputMode="numeric"
        />

        <div className="space-y-1">
          <Input
            label={t("login.passwordLabel")}
            placeholder={t("login.passwordPlaceholder")}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
            data-testid="input-password"
            error={fieldErrors.password}
            id="login-password"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isPending}
          aria-busy={isPending}
          data-testid="button-login"
          className="w-full"
        >
          {!isPending && <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />}
          {t("login.submitButton")}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-neutral-50 px-3 text-xs text-neutral-400">ou</span>
        </div>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-neutral-500">
        Não tem uma conta?{" "}
        <Link href="/register" className="font-medium text-brand-primary hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </div>
  );
}
