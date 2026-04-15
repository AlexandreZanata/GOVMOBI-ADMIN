# Design System Components — GOVMOBI-ADMIN

> **Status:** Authoritative
> **Owner:** Engineering Lead + Design Lead
> **Source:** `src/components/atoms/`
> **Cross-links:** [`design-system-tokens.md`](./design-system-tokens.md) · [`design-system-accessibility.md`](./design-system-accessibility.md) · [`design-system-quick-reference.md`](./design-system-quick-reference.md)

---

## Component Contract Format

Each component entry documents:
- Props API (all props, types, defaults)
- Variants and sizes
- Accessibility requirements
- i18n keys used
- `data-testid` convention
- Usage examples (correct and forbidden)

---

## Button

**File:** `src/components/atoms/Button.tsx`
**Export:** `Button`, `ButtonProps`, `ButtonVariant`, `ButtonSize`

### Props

| Prop          | Type                                                   | Default     | Required | Description                    |
|---------------|--------------------------------------------------------|-------------|----------|--------------------------------|
| `variant`     | `"primary" \| "secondary" \| "ghost" \| "destructive"` | `"primary"` | No       | Visual style                   |
| `size`        | `"sm" \| "md" \| "lg"`                                 | `"md"`      | No       | Size scale                     |
| `isLoading`   | `boolean`                                              | `false`     | No       | Shows spinner; disables button |
| `disabled`    | `boolean`                                              | `false`     | No       | Native disabled state          |
| `children`    | `React.ReactNode`                                      | —           | Yes      | Button label                   |
| `data-testid` | `string`                                               | —           | No       | Test selector                  |
| `onClick`     | `React.MouseEventHandler`                              | —           | No       | Click handler                  |
| `...rest`     | `ButtonHTMLAttributes`                                 | —           | No       | All native button props        |

### Variants

| Variant       | Use Case                                           | Color                              |
|---------------|----------------------------------------------------|------------------------------------|
| `primary`     | Main action (Save, Confirm, Assign)                | `brand-primary`                    |
| `secondary`   | Supporting action (Edit, View)                     | `brand-secondary`                  |
| `ghost`       | Tertiary action (Cancel, Back)                     | Transparent + `brand-primary` text |
| `destructive` | Irreversible action (Delete, Deactivate, Override) | `danger`                           |

### Accessibility

- `aria-busy="true"` set when `isLoading=true`
- `aria-label` set to `t("common:loading")` when loading
- `disabled` attribute prevents click events (no JS needed)
- Focus ring: `focus-visible:ring-2 focus-visible:ring-offset-2`

### i18n Keys

| Key       | Namespace | Used For                           |
|-----------|-----------|------------------------------------|
| `loading` | `common`  | `aria-label` when `isLoading=true` |

### Usage

```tsx
// ✅ Primary action
<Button variant="primary" onClick={handleSave}>Save Run</Button>

// ✅ Destructive with loading state
<Button variant="destructive" isLoading={isCancelling}>
  Cancel Run
</Button>

// ✅ With permission gate
<Can perform="run:override">
  <Button variant="destructive">Override Status</Button>
</Can>

// ❌ Hardcoded label (use i18n)
<Button>Submit</Button>

// ❌ Role check instead of Can
{user.role === "ADMIN" && <Button>Delete</Button>}
```

---

## Badge

**File:** `src/components/atoms/Badge.tsx`
**Export:** `Badge`, `BadgeProps`, `BadgeVariant`

### Props

| Prop          | Type                                                        | Default     | Required | Description      |
|---------------|-------------------------------------------------------------|-------------|----------|------------------|
| `variant`     | `"success" \| "warning" \| "danger" \| "info" \| "neutral"` | `"neutral"` | No       | Semantic color   |
| `children`    | `React.ReactNode`                                           | —           | Yes      | Badge label text |
| `data-testid` | `string`                                                    | —           | No       | Test selector    |

### Variant → Token Mapping

| Variant   | Background       | Text               |
|-----------|------------------|--------------------|
| `success` | `bg-success/15`  | `text-success`     |
| `warning` | `bg-warning/15`  | `text-warning`     |
| `danger`  | `bg-danger/15`   | `text-danger`      |
| `info`    | `bg-info/15`     | `text-info`        |
| `neutral` | `bg-neutral-200` | `text-neutral-700` |

### Usage

```tsx
// ✅ Semantic badge
<Badge variant="success">Active</Badge>
<Badge variant="danger">Overdue</Badge>

// ❌ Do not use Badge for run status — use StatusPill instead
<Badge variant="info">In Progress</Badge>
```

---

## Input

**File:** `src/components/atoms/Input.tsx`
**Export:** `Input`, `InputProps`

### Props

| Prop          | Type                  | Default        | Required | Description                                   |
|---------------|-----------------------|----------------|----------|-----------------------------------------------|
| `label`       | `string`              | —              | No       | Visible label above input                     |
| `error`       | `string`              | —              | No       | Error message; marks field invalid            |
| `helperText`  | `string`              | —              | No       | Hint text below input                         |
| `id`          | `string`              | Auto-generated | No       | Input ID (auto-derived from label if omitted) |
| `data-testid` | `string`              | —              | No       | Test selector                                 |
| `...rest`     | `InputHTMLAttributes` | —              | No       | All native input props                        |

### Accessibility

- `aria-invalid="true"` set when `error` prop is present
- `aria-describedby` links input to error message and/or helper text
- Error message rendered with `role="alert"` for screen reader announcement
- Label is always associated via `htmlFor` / `id`

### Usage

```tsx
// ✅ With label and error
<Input
  label={t("runs:form.title")}
  error={errors.title}
  data-testid="input-run-title"
  {...register("title")}
/>

// ✅ With helper text
<Input
  label={t("users:form.email")}
  helperText={t("users:form.emailHelper")}
  type="email"
/>

// ❌ Input without label (accessibility violation)
<Input placeholder="Enter title" />
```

---

## Avatar

**File:** `src/components/atoms/Avatar.tsx`
**Export:** `Avatar`, `AvatarProps`, `AvatarSize`

### Props

| Prop          | Type                   | Default | Required | Description                                |
|---------------|------------------------|---------|----------|--------------------------------------------|
| `name`        | `string`               | —       | Yes      | Full name for initials + `aria-label`      |
| `src`         | `string`               | —       | No       | Image URL; falls back to initials on error |
| `size`        | `"sm" \| "md" \| "lg"` | `"md"`  | No       | Size scale                                 |
| `data-testid` | `string`               | —       | No       | Test selector                              |

### Size Scale

| Size | Dimensions | Font Size   |
|------|------------|-------------|
| `sm` | 32×32px    | `text-xs`   |
| `md` | 40×40px    | `text-sm`   |
| `lg` | 56×56px    | `text-base` |

### Initials Logic

- Takes first letter of each word, up to 2 words
- `"Jane Doe"` → `"JD"`, `"Admin"` → `"A"`, `"Mary Jane Watson"` → `"MJ"`

### Accessibility

- `role="img"` on the wrapper `<span>`
- `aria-label` set to the full `name` prop
- Image `alt` set to `name` prop

---

## StatusPill

**File:** `src/components/atoms/StatusPill.tsx`
**Export:** `StatusPill`, `StatusPillProps`

### Props

| Prop          | Type        | Default | Required | Description                     |
|---------------|-------------|---------|----------|---------------------------------|
| `status`      | `RunStatus` | —       | Yes      | Run lifecycle status enum value |
| `data-testid` | `string`    | —       | No       | Test selector                   |

### Status → Class Mapping

| Status        | CSS Class            | Visual |
|---------------|----------------------|--------|
| `PENDING`     | `status-pending`     | Grey   |
| `ASSIGNED`    | `status-assigned`    | Blue   |
| `IN_PROGRESS` | `status-in-progress` | Amber  |
| `COMPLETED`   | `status-completed`   | Green  |
| `CANCELLED`   | `status-cancelled`   | Red    |

### i18n Keys

| Key                  | Namespace | Example Output |
|----------------------|-----------|----------------|
| `status.PENDING`     | `runs`    | "Pending"      |
| `status.ASSIGNED`    | `runs`    | "Assigned"     |
| `status.IN_PROGRESS` | `runs`    | "In Progress"  |
| `status.COMPLETED`   | `runs`    | "Completed"    |
| `status.CANCELLED`   | `runs`    | "Cancelled"    |

### Accessibility

- `aria-label` set to the translated status label
- Status communicated via both color AND text (never color alone)

### Usage

```tsx
// ✅ Correct
<StatusPill status={run.status} data-testid="run-status" />

// ❌ Do not pass raw strings — use the enum
<StatusPill status="PENDING" />  // TypeScript will catch this
```

---

## Review Checklist

- [ ] Every implemented atom has a complete props table
- [ ] Every prop has type, default, required flag, and description
- [ ] Accessibility requirements are documented per component
- [ ] i18n keys are listed per component
- [ ] Usage examples show correct and forbidden patterns
- [ ] Component status table in design-system.md is kept in sync
