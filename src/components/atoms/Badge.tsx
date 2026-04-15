"use client";

/** Semantic color variants mapped to design tokens */
export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface BadgeProps {
  /** Semantic color variant */
  variant?: BadgeVariant;
  /** Badge label */
  children: React.ReactNode;
  /** Test selector */
  "data-testid"?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-neutral-200 text-neutral-700",
};

/**
 * GovMobile semantic badge / label chip.
 *
 * @param variant - Semantic color (default: "neutral")
 * @param children - Badge text content
 * @returns Inline badge element
 */
export function Badge({
  variant = "neutral",
  children,
  "data-testid": testId,
}: BadgeProps) {
  return (
    <span
      data-testid={testId}
      className={[
        "inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
      ].join(" ")}
    >
      {children}
    </span>
  );
}
