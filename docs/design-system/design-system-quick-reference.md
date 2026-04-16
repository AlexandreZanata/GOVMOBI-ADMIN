# Design System Quick Reference — GOVMOBI-ADMIN

> One-page cheat sheet for daily development. For full details see the linked docs.

---

## Color Tokens → Tailwind Classes

| Token           | Class (bg)                     | Class (text)           | Use                            |
|-----------------|--------------------------------|------------------------|--------------------------------|
| Brand Primary   | `bg-brand-primary`             | `text-brand-primary`   | Primary actions                |
| Brand Secondary | `bg-brand-secondary`           | `text-brand-secondary` | Avatars, secondary UI          |
| Success         | `bg-success` / `bg-success/15` | `text-success`         | Completed, positive            |
| Warning         | `bg-warning` / `bg-warning/15` | `text-warning`         | In-progress, caution           |
| Danger          | `bg-danger` / `bg-danger/15`   | `text-danger`          | Errors, destructive, cancelled |
| Info            | `bg-info` / `bg-info/15`       | `text-info`            | Assigned, informational        |
| Neutral 50      | `bg-neutral-50`                | —                      | Page background                |
| Neutral 200     | `bg-neutral-200`               | —                      | Borders, pending bg            |
| Neutral 700     | —                              | `text-neutral-700`     | Labels, pending text           |
| Neutral 900     | —                              | `text-neutral-900`     | Headings                       |

---

## Radius Tokens

| Token | CSS Var         | Value   | Usage                  |
|-------|-----------------|---------|------------------------|
| sm    | `--radius-sm`   | 0.25rem | Tight chips            |
| md    | `--radius-md`   | 0.5rem  | Buttons, inputs        |
| lg    | `--radius-lg`   | 0.75rem | Modals, panels         |
| full  | `--radius-full` | 9999px  | Pills, badges, avatars |

```tsx
// Use in className
className="rounded-[var(--radius-md)]"
```

---

## Atom Components

| Component    | Import               | Key Props                      |
|--------------|----------------------|--------------------------------|
| `Button`     | `@/components/atoms` | `variant`, `size`, `isLoading` |
| `Badge`      | `@/components/atoms` | `variant`                      |
| `Input`      | `@/components/atoms` | `label`, `error`, `helperText` |
| `Avatar`     | `@/components/atoms` | `name`, `src`, `size`          |
| `StatusPill` | `@/components/atoms` | `status: RunStatus`            |

---

## Button Variants

```tsx
<Button variant="primary">Save</Button>       // Main action
<Button variant="secondary">Edit</Button>     // Supporting
<Button variant="ghost">Cancel</Button>       // Tertiary
<Button variant="destructive">Delete</Button> // Irreversible
<Button isLoading>Saving...</Button>          // Loading state
```

---

## StatusPill — All Statuses

```tsx
<StatusPill status={RunStatus.PENDING} />     // Grey
<StatusPill status={RunStatus.ASSIGNED} />    // Blue
<StatusPill status={RunStatus.IN_PROGRESS} /> // Amber
<StatusPill status={RunStatus.COMPLETED} />   // Green
<StatusPill status={RunStatus.CANCELLED} />   // Red
```

---

## Run Status CSS Classes (direct use)

```text
.status-pending { /* grey bg + grey text */ }
.status-assigned { /* blue bg + blue text */ }
.status-in-progress { /* amber bg + amber text */ }
.status-completed { /* green bg + green text */ }
.status-cancelled { /* red bg + red text */ }
```

---

## Permission Gate

```tsx
import { Can } from "@/components/atoms/Can";
import { usePermissions } from "@/hooks/usePermissions";

// JSX gate
<Can perform="run:override">
  <Button variant="destructive">Override</Button>
</Can>

// Hook gate
const { can } = usePermissions();
if (!can("run:create")) return <AccessDenied />;
```

---

## i18n Namespaces

| Namespace | Content                             |
|-----------|-------------------------------------|
| `common`  | loading, cancel, confirm, close     |
| `runs`    | status labels, form fields, actions |
| `users`   | role labels, form fields            |
| `auth`    | login, logout, session              |

```tsx
const { t } = useTranslation("runs");
t("status.PENDING")    // → "Pending"
t("status.IN_PROGRESS") // → "In Progress"
```

---

## Forbidden Patterns (Quick Ref)

- ❌ Hardcoded color: `style={{ color: "#1a56db" }}` or `className="bg-blue-600"`
- ❌ Hardcoded string: `<button aria-label="Submit">` (must use i18n)
- ❌ Role check in component: `if (user.role === "ADMIN") { ... }`
- ❌ Direct fetch in UI: `await fetch("/api/runs")`
- ❌ Any type usage: `const data: any = response;`

---

## data-testid Convention

Pattern: `{component}-{context}-{variant}`

- `data-testid="button-save-run"`
- `data-testid="input-run-title"`
- `data-testid="status-pill-run-001"`
- `data-testid="avatar-user-jane-doe"`
- `data-testid="badge-priority-high"`
