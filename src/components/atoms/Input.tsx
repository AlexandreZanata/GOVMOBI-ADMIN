"use client";

import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text */
  label?: string;
  /** Validation error message — renders in danger color */
  error?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Test selector */
  "data-testid"?: string;
}

/**
 * GovMobile labeled input field with error and helper text support.
 *
 * @param label - Visible label rendered above the input
 * @param error - Error message; marks the field as invalid
 * @param helperText - Supplementary hint text below the input
 * @param id
 * @param className
 * @param testId
 * @param props
 * @returns Accessible input group
 */
export function Input({
  label,
  error,
  helperText,
  id,
  className = "",
  "data-testid": testId,
  ...props
}: InputProps) {
  const inputId = id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        data-testid={testId}
        aria-invalid={!!error}
        aria-describedby={
          [error ? errorId : null, helperText ? helperId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={[
          "h-10 w-full rounded-md border px-3 text-sm",
          "bg-white text-neutral-900 placeholder:text-neutral-400",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          error
            ? "border-danger focus:ring-danger"
            : "border-neutral-300 focus:ring-brand-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        ].join(" ")}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
}
