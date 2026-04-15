/**
 * GovMobile design tokens.
 *
 * All color values are HSL CSS variable references so they resolve
 * against the custom properties defined in govmobile.css.
 * Use these in Tailwind arbitrary values or inline CSS-var() calls.
 *
 * @example
 *   style={{ color: tokens.colors.brand.primary }}
 */
export const tokens = {
  colors: {
    brand: {
      /** Institutional blue — primary action color */
      primary: "hsl(var(--color-brand-primary))",
      /** Supporting blue-grey */
      secondary: "hsl(var(--color-brand-secondary))",
    },
    semantic: {
      success: "hsl(var(--color-success))",
      warning: "hsl(var(--color-warning))",
      danger: "hsl(var(--color-danger))",
      info: "hsl(var(--color-info))",
    },
    neutral: {
      50: "hsl(var(--color-neutral-50))",
      100: "hsl(var(--color-neutral-100))",
      200: "hsl(var(--color-neutral-200))",
      300: "hsl(var(--color-neutral-300))",
      400: "hsl(var(--color-neutral-400))",
      500: "hsl(var(--color-neutral-500))",
      600: "hsl(var(--color-neutral-600))",
      700: "hsl(var(--color-neutral-700))",
      800: "hsl(var(--color-neutral-800))",
      900: "hsl(var(--color-neutral-900))",
    },
  },
  radius: {
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    full: "var(--radius-full)",
  },
  font: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
  },
} as const;

export type Tokens = typeof tokens;
