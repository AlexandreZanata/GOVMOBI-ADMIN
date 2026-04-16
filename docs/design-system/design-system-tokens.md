# Design System Tokens — GOVMOBI-ADMIN

> **Source of truth:** `src/theme/govmobile.css` (CSS variables) + `src/theme/tokens.ts` (TypeScript)
> **Cross-links:** [`design-system-theme-reference.md`](./design-system-theme-reference.md) · [`design-system-quick-reference.md`](./design-system-quick-reference.md)

---

## Color Tokens

### Brand Colors

| Token Name        | CSS Variable              | HSL Value     | Tailwind Class                                | Use Case                                  |
|-------------------|---------------------------|---------------|-----------------------------------------------|-------------------------------------------|
| `brand.primary`   | `--color-brand-primary`   | `220 72% 38%` | `bg-brand-primary` / `text-brand-primary`     | Primary actions, links, focus rings       |
| `brand.secondary` | `--color-brand-secondary` | `215 30% 52%` | `bg-brand-secondary` / `text-brand-secondary` | Avatar backgrounds, secondary UI elements |

### Semantic Colors

| Token Name         | CSS Variable      | HSL Value     | Tailwind Class                | Use Case                                      |
|--------------------|-------------------|---------------|-------------------------------|-----------------------------------------------|
| `semantic.success` | `--color-success` | `142 71% 35%` | `bg-success` / `text-success` | Completed status, positive feedback           |
| `semantic.warning` | `--color-warning` | `38 92% 48%`  | `bg-warning` / `text-warning` | In-progress status, caution states            |
| `semantic.danger`  | `--color-danger`  | `0 72% 51%`   | `bg-danger` / `text-danger`   | Destructive actions, errors, cancelled status |
| `semantic.info`    | `--color-info`    | `199 89% 42%` | `bg-info` / `text-info`       | Assigned status, informational states         |

### Neutral Scale

| Token         | CSS Variable          | Tailwind Class       | Use Case                             |
|---------------|-----------------------|----------------------|--------------------------------------|
| `neutral.50`  | `--color-neutral-50`  | `bg-neutral-50`      | Page background                      |
| `neutral.100` | `--color-neutral-100` | `bg-neutral-100`     | Subtle backgrounds, hover states     |
| `neutral.200` | `--color-neutral-200` | `bg-neutral-200`     | Borders, dividers, pending status bg |
| `neutral.300` | `--color-neutral-300` | `border-neutral-300` | Input borders                        |
| `neutral.400` | `--color-neutral-400` | `text-neutral-400`   | Placeholder text                     |
| `neutral.500` | `--color-neutral-500` | `text-neutral-500`   | Helper text, secondary labels        |
| `neutral.600` | `--color-neutral-600` | `text-neutral-600`   | Body text secondary                  |
| `neutral.700` | `--color-neutral-700` | `text-neutral-700`   | Labels, pending status text          |
| `neutral.800` | `--color-neutral-800` | `text-neutral-800`   | Body text primary                    |
| `neutral.900` | `--color-neutral-900` | `text-neutral-900`   | Headings, high-contrast text         |

---

## Run Status Color Mapping

| Status        | CSS Class            | Background Token | Text Token    |
|---------------|----------------------|------------------|---------------|
| `PENDING`     | `status-pending`     | `neutral-200`    | `neutral-700` |
| `ASSIGNED`    | `status-assigned`    | `info/15%`       | `info`        |
| `IN_PROGRESS` | `status-in-progress` | `warning/15%`    | `warning`     |
| `COMPLETED`   | `status-completed`   | `success/15%`    | `success`     |
| `CANCELLED`   | `status-cancelled`   | `danger/15%`     | `danger`      |

These classes are defined in `src/theme/govmobile.css` and used exclusively by `StatusPill`.

---

## Radius Tokens

| Token         | CSS Variable    | Value     | Tailwind Equivalent | Use Case                    |
|---------------|-----------------|-----------|---------------------|-----------------------------| 
| `radius.sm`   | `--radius-sm`   | `0.25rem` | `rounded-sm`        | Small chips, tight elements |
| `radius.md`   | `--radius-md`   | `0.5rem`  | `rounded-md`        | Buttons, inputs, cards      |
| `radius.lg`   | `--radius-lg`   | `0.75rem` | `rounded-lg`        | Modals, panels              |
| `radius.full` | `--radius-full` | `9999px`  | `rounded-full`      | Pills, badges, avatars      |

---

## Typography Tokens

| Token       | CSS Variable  | Value      | Use Case              |
|-------------|---------------|------------|-----------------------|
| `font.sans` | `--font-sans` | Geist Sans | All UI text           |
| `font.mono` | `--font-mono` | Geist Mono | Code, IDs, timestamps |

---

## Using Tokens in Code

### In Tailwind classes (preferred)

```tsx
// ✅ Use Tailwind token classes
<div className="bg-brand-primary text-white rounded-[var(--radius-md)]">
<span className="text-danger">Error message</span>
<div className="bg-neutral-50 border border-neutral-200">
```

### In TypeScript (for dynamic values)

```typescript
import { tokens } from "@/theme/tokens";

// Use when Tailwind arbitrary values are insufficient
const style = { color: tokens.colors.semantic.danger };
```

### Forbidden

```tsx
// ❌ Hardcoded color
<div style={{ backgroundColor: "#1a56db" }}>

// ❌ Tailwind color not from tokens
<div className="bg-blue-600">

// ❌ Inline style for values that have token equivalents
<div style={{ borderRadius: "8px" }}>
```

---

## Review Checklist

- [ ] All tokens have CSS variable, HSL value, Tailwind class, and use case
- [ ] Run status color mapping matches `govmobile.css` exactly
- [ ] Radius and typography tokens are complete
- [ ] Usage examples show correct and forbidden patterns
- [ ] Token values match `src/theme/govmobile.css`
