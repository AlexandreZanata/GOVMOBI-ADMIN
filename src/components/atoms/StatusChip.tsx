"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

/** Semantic status chip variants mapped to design tokens. */
export type StatusChipVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

/** Allowed i18n namespaces for GovMobile UI strings. */
export type StatusChipNamespace = "common" | "runs" | "users" | "auth";

/**
 * Props for the StatusChip atom.
 */
export interface StatusChipProps {
  /** Semantic visual style (default: "neutral"). */
  variant?: StatusChipVariant;
  /** i18n namespace used to resolve the label key (default: "common"). */
  namespace?: StatusChipNamespace;
  /** Translation key for the visible label (default: `statusChip.<variant>`). */
  labelKey?: string;
  /** Enables button behavior and keyboard interaction. */
  interactive?: boolean;
  /** Pressed state announced when `interactive` is true (default: false). */
  pressed?: boolean;
  /** Disables interaction when `interactive` is true (default: false). */
  disabled?: boolean;
  /** Callback fired when interactive chip is clicked. */
  onClick?: () => void;
  /** Additional utility classes. */
  className?: string;
  /** Test selector. */
  "data-testid"?: string;
}

const variantClasses: Record<StatusChipVariant, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-neutral-200 text-neutral-700",
};

/**
 * Renders a semantic status chip for concise, token-based state messaging.
 *
 * @param props - StatusChip configuration including variant, i18n label key, and optional interaction behavior
 * @returns A translated status chip rendered as a `span` or interactive `button`
 */
export function StatusChip({
  variant = "neutral",
  namespace = "common",
  labelKey,
  interactive = false,
  pressed = false,
  disabled = false,
  onClick,
  className = "",
  "data-testid": testId,
}: StatusChipProps) {
  const { t } = useTranslation(namespace);
  const resolvedLabelKey = labelKey ?? `statusChip.${variant}`;
  const label = t(resolvedLabelKey);
  const baseClasses = [
    "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium",
    variantClasses[variant],
    interactive ? "cursor-pointer transition-opacity hover:opacity-90" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (interactive) {
    return (
      <button
        type="button"
        data-testid={testId}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className={[
          baseClasses,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        {label}
      </button>
    );
  }

  return (
    <span data-testid={testId} aria-label={label} className={baseClasses}>
      {label}
    </span>
  );
}
