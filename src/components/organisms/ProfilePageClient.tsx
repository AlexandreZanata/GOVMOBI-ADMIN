"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { User, Mail, CreditCard, ShieldCheck, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

import { useAuthStore } from "@/stores/authStore";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import { formatCpf } from "@/lib/cpfUtils";
import { Button } from "@/components/atoms";
import type { ApiError } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  ADMIN:      "bg-danger/10 text-danger",
  SUPERVISOR: "bg-warning/10 text-warning",
  DISPATCHER: "bg-info/10 text-info",
  AGENT:      "bg-neutral-100 text-neutral-600",
};

interface PwErrors {
  senhaAntiga?: string;
  novaSenha?: string;
  confirmarSenha?: string;
  general?: string;
}

export function ProfilePageClient() {
  const { t } = useTranslation("auth");
  const user = useAuthStore((s) => s.user);
  const { mutate, isPending, isSuccess, isError, error, reset } = useChangePassword();

  const [senhaAntiga, setSenhaAntiga] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [errors, setErrors] = useState<PwErrors>({});

  function validate(): boolean {
    const e: PwErrors = {};
    if (!senhaAntiga) e.senhaAntiga = t("validation.passwordRequired");
    if (!novaSenha) e.novaSenha = t("validation.passwordRequired");
    else if (novaSenha.length < 8) e.novaSenha = t("changePassword.errors.passwordTooShort");
    if (!confirmarSenha) e.confirmarSenha = t("validation.passwordRequired");
    else if (novaSenha !== confirmarSenha) e.confirmarSenha = t("changePassword.errors.passwordMismatch");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    reset();
    mutate(
      { senhaAntiga, novaSenha },
      {
        onSuccess: () => {
          setSenhaAntiga("");
          setNovaSenha("");
          setConfirmarSenha("");
          setErrors({});
        },
        onError: (err) => {
          const apiErr = err as ApiError;
          if (apiErr.status === 401) setErrors({ senhaAntiga: t("changePassword.errors.incorrectPassword") });
          else if (apiErr.code === "NETWORK_ERROR") setErrors({ general: t("errors.networkError") });
          else setErrors({ general: apiErr.message || t("errors.serverError") });
        },
      }
    );
  }

  const roleKey = String(user?.role ?? "").toUpperCase();

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{t("profile.title")}</h1>
          <p className="mt-0.5 text-sm text-neutral-500">{t("profile.subtitle")}</p>
        </div>
      </div>

      {/* Identity card */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("profile.fieldColumn")}</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("profile.valueColumn")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            <InfoRow icon={User} label={t("profile.fullName")} value={user?.nome} />
            <InfoRow icon={Mail} label={t("profile.email")} value={user?.email} />
            <InfoRow icon={CreditCard} label={t("profile.cpf")} value={user?.cpf ? formatCpf(user.cpf) : undefined} />
            <InfoRow icon={ShieldCheck} label={t("profile.role")}>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[roleKey] ?? "bg-neutral-100 text-neutral-600"}`}>
                {t(`profile.roles.${roleKey}`, { defaultValue: roleKey })}
              </span>
            </InfoRow>
          </tbody>
        </table>
      </div>

      {/* Change password card */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-neutral-400" aria-hidden="true" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t("profile.changePasswordSection")}</h2>
          </div>
        </div>

        <div className="px-5 py-5">
          {isSuccess && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <p className="text-sm text-success">{t("changePassword.successMessage")}</p>
            </div>
          )}

          {errors.general && (
            <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
              <p className="text-sm text-danger">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <PwField
                id="senhaAntiga"
                label={t("changePassword.currentPasswordLabel")}
                placeholder={t("changePassword.currentPasswordPlaceholder")}
                value={senhaAntiga}
                onChange={(v) => { setSenhaAntiga(v); if (errors.senhaAntiga) setErrors((p) => ({ ...p, senhaAntiga: undefined })); }}
                error={errors.senhaAntiga}
                disabled={isPending}
              />
              <PwField
                id="novaSenha"
                label={t("changePassword.newPasswordLabel")}
                placeholder={t("changePassword.newPasswordPlaceholder")}
                value={novaSenha}
                onChange={(v) => { setNovaSenha(v); if (errors.novaSenha) setErrors((p) => ({ ...p, novaSenha: undefined })); }}
                error={errors.novaSenha}
                disabled={isPending}
              />
              <PwField
                id="confirmarSenha"
                label={t("changePassword.confirmPasswordLabel")}
                placeholder={t("changePassword.confirmPasswordPlaceholder")}
                value={confirmarSenha}
                onChange={(v) => { setConfirmarSenha(v); if (errors.confirmarSenha) setErrors((p) => ({ ...p, confirmarSenha: undefined })); }}
                error={errors.confirmarSenha}
                disabled={isPending}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={isPending} aria-busy={isPending}>
                {t("changePassword.submitButton")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: typeof User;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <tr className="transition-colors hover:bg-neutral-50/60">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 text-neutral-500">
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="text-sm">{label}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        {children ?? (
          <span className="text-sm font-medium text-neutral-900">{value ?? "—"}</span>
        )}
      </td>
    </tr>
  );
}

function PwField({
  id, label, placeholder, value, onChange, error, disabled,
}: {
  id: string; label: string; placeholder: string;
  value: string; onChange: (v: string) => void;
  error?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className={[
          "h-9 w-full rounded-lg border px-3 text-sm transition-colors",
          "placeholder:text-neutral-400 focus:outline-none focus:ring-2",
          error
            ? "border-danger bg-danger/5 focus:border-danger focus:ring-danger/20"
            : "border-neutral-200 bg-neutral-50 focus:border-brand-primary focus:bg-white focus:ring-brand-primary/20",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
