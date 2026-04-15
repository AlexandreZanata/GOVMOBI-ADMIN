# Theme Reference — GOVMOBI-ADMIN

> **Source:** `src/theme/govmobile.css` · `postcss.config.mjs`
> **Cross-links:** [`design-system-tokens.md`](./design-system-tokens.md) · [`design-system-quick-reference.md`](./design-system-quick-reference.md)

---

## Tailwind v4 Architecture

This project uses **Tailwind CSS v4** with `@tailwindcss/postcss`. Key differences from v3:

| v3                                            | v4 (this project)                                |
|-----------------------------------------------|--------------------------------------------------|
| `tailwind.config.js` for theme                | `@theme` block in CSS                            |
| `@tailwind base/components/utilities`         | `@import 'tailwindcss'`                          |
| `theme.extend.colors`                         | CSS custom properties in `@theme`                |
| `postcss.config.js` with `tailwindcss` plugin | `postcss.config.mjs` with `@tailwindcss/postcss` |

**Do not create a `tailwind.config.ts` or `tailwind.config.js`.** Theme extension is done exclusively in `src/theme/govmobile.css`.

---

## CSS File Structure

```
src/app/globals.css          ← Entry point: imports tailwindcss + govmobile.css
src/theme/govmobile.css      ← All custom properties, @theme block, status utilities
src/theme/tokens.ts          ← TypeScript token object (references CSS variables)
```

### globals.css

```text
@import "tailwindcss";
@import "../../src/theme/govmobile.css";

body {
  font-family: var(--font-sans, Arial, Helvetica, sans-serif);
  background-color: hsl(var(--color-neutral-50));
  color: hsl(var(--color-neutral-900));
}
```

### govmobile.css Structure

```text
/* 1. Raw HSL values in :root (no hsl() wrapper) */
:root {
  --color-brand-primary: 220 72% 38%;
  /* ... */
}

/* 2. Tailwind v4 @theme block (with hsl() wrapper) */
@theme inline {
  --color-brand-primary: hsl(var(--color-brand-primary));
  /* ... */
}

/* 3. Status utility classes */
.status-pending { background: hsl(var(--color-neutral-200)); }
.status-assigned { background: hsl(var(--color-info) / 0.15); }
/* additional status classes follow the same pattern */
```

---

## How to Extend the Theme

### Adding a New Color Token

1. Add the raw HSL value to `:root` in `govmobile.css`:
```css
:root {
  --color-accent: 270 60% 50%;
}
```

1. Add it to the `@theme inline` block:
```css
@theme inline {
  --color-accent: hsl(var(--color-accent));
}
```

1. Add it to `src/theme/tokens.ts`:
```typescript
export const tokens = {
  colors: {
    accent: "hsl(var(--color-accent))",
    // ...
  }
}
```

1. Update `design-system-tokens.md` with the new token.
2. Get Design Lead approval before merging.

### Adding a New Radius Token

```css
/* govmobile.css */
:root {
  --radius-xl: 1rem;
}
@theme inline {
  --radius-xl: var(--radius-xl);
}
```

---

## Font Variables

Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and mapped to CSS variables:

```typescript
const geistSans = Geist({
  variable: "--font-sans",  // Maps to tokens.font.sans
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",  // Maps to tokens.font.mono
  subsets: ["latin"],
});
```

The `--font-sans` and `--font-mono` variables are then available throughout the application via the `@theme` block.

---

## Dark Mode

Dark mode is **not implemented in v1**. The architecture supports it:
- All colors are defined as CSS variables
- A `@media (prefers-color-scheme: dark)` block can be added to `govmobile.css`
- Or a `.dark` class strategy can be used with Tailwind's `dark:` variant

Do not add dark mode styles without a design decision and Design Lead approval.

---

## Review Checklist

- [ ] Tailwind v4 differences from v3 are documented
- [ ] CSS file structure is accurate
- [ ] Extension process for new tokens is step-by-step
- [ ] Font variable mapping is documented
- [ ] Dark mode status is explicit
