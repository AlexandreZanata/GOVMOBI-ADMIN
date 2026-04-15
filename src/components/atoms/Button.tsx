"use client";

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";
import React from "react";

/** Button visual variants */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

/** Button size scale */
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size scale */
  size?: ButtonSize;
  /** Shows a spinner and disables the button */
  isLoading?: boolean;
  /** Test selector */
  "data-testid"?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-primary text-white hover:opacity-90 focus-visible:ring-brand-primary",
  secondary:
    "bg-brand-secondary text-white hover:opacity-90 focus-visible:ring-brand-secondary",
  ghost:
    "bg-transparent text-brand-primary hover:bg-neutral-100 focus-visible:ring-brand-primary",
  destructive:
    "bg-danger text-white hover:opacity-90 focus-visible:ring-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * GovMobile primary interactive button.
 *
 * @param variant - Visual style (default: "primary")
 * @param size - Size scale (default: "md")
 * @param isLoading - Renders a spinner and disables interaction
 * @param disabled
 * @param children - Button label
 * @param className
 * @param testId
 * @param props
 * @returns Accessible button element
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    children,
    className = "",
    "data-testid": testId,
    ...props
  },
  ref
) {
  const { t } = useTranslation("common");

  return (
    <button
      ref={ref}
      data-testid={testId}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? t("loading") : undefined}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});
