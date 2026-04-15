# Accessibility Anti-Patterns — GOVMOBI-ADMIN

> **Standard:** WCAG 2.1 AA
> **Cross-links:** [`../design-system/design-system-accessibility.md`](../design-system/design-system-accessibility.md) · [`design-pattern.md`](./design-pattern.md)

---

## Anti-Pattern 1: Color-Only Status Indicators

**Violation:** WCAG 1.4.1 — Use of Color

```tsx
// ❌ Anti-pattern — color is the only differentiator
<span className="w-3 h-3 rounded-full bg-success" />
<span className="w-3 h-3 rounded-full bg-danger" />
```

**Fix:** Always pair color with text or icon.

```tsx
// ✅ Color + text via StatusPill
<StatusPill status={RunStatus.COMPLETED} />

// ✅ Color + icon + text for inline indicators
<span className="flex items-center gap-1 text-success text-sm">
  <CheckIcon aria-hidden="true" className="h-4 w-4" />
  {t("runs:status.COMPLETED")}
</span>
```

---

## Anti-Pattern 2: Icon-Only Buttons Without Labels

**Violation:** WCAG 1.1.1 — Non-text Content, WCAG 4.1.2 — Name, Role, Value

```tsx
// ❌ Anti-pattern — no accessible name
<button onClick={handleEdit}>
  <EditIcon />
</button>
```

**Fix:** Add `aria-label` to all icon-only buttons.

```tsx
// ✅ aria-label on icon-only button
<button
  aria-label={t("common:edit")}
  onClick={handleEdit}
>
  <EditIcon aria-hidden="true" />
</button>

// ✅ Or use Button component with sr-only text
<Button variant="ghost" onClick={handleEdit}>
  <EditIcon aria-hidden="true" />
  <span className="sr-only">{t("common:edit")}</span>
</Button>
```

---

## Anti-Pattern 3: Missing Form Labels

**Violation:** WCAG 1.3.1 — Info and Relationships, WCAG 3.3.2 — Labels or Instructions

```tsx
// ❌ Anti-pattern — placeholder is not a label
<input
  type="text"
  placeholder={t("runs:form.titlePlaceholder")}
/>

// ❌ Anti-pattern — label not associated with input
<label>{t("runs:form.title")}</label>
<input type="text" />
```

**Fix:** Always use the `Input` component which handles label association automatically.

```tsx
// ✅ Input component handles label + aria association
<Input
  label={t("runs:form.title")}
  id="run-title"
  error={errors.title?.message}
/>
```

---

## Anti-Pattern 4: Focus Ring Removal

**Violation:** WCAG 2.4.7 — Focus Visible

```css
/* ❌ Anti-pattern — removes focus ring globally */
* { outline: none; }
button:focus { outline: none; }
```

**Fix:** Use `focus-visible` to show focus rings for keyboard users only.

```css
/* ✅ Correct — focus-visible preserves keyboard focus ring */
/* Applied via Tailwind in Button.tsx: */
/* focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary */
```

---

## Anti-Pattern 5: Non-Descriptive Link and Button Text

**Violation:** WCAG 2.4.6 — Headings and Labels, WCAG 2.4.9 — Link Purpose

```tsx
// ❌ Anti-pattern — "Click here" / "View" with no context
<a href={`/runs/${run.id}`}>View</a>
<button onClick={handleAction}>Click here</button>

// ❌ Anti-pattern — same text for different actions
{runs.map(run => (
  <a href={`/runs/${run.id}`}>View details</a>
))}
```

**Fix:** Make link/button text descriptive or use `aria-label`.

```tsx
// ✅ Descriptive text
<a href={`/runs/${run.id}`}>
  {t("runs:actions.viewDetails", { title: run.title })}
</a>

// ✅ Or aria-label for compact UI
<a
  href={`/runs/${run.id}`}
  aria-label={t("runs:actions.viewRun", { title: run.title })}
>
  {t("common:view")}
</a>
```

---

## Anti-Pattern 6: Keyboard Trap in Custom Dropdowns

**Violation:** WCAG 2.1.2 — No Keyboard Trap

```tsx
// ❌ Anti-pattern — custom dropdown with no keyboard support
function CustomDropdown({ options }: { options: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)}>
      {open && options.map(opt => <div key={opt}>{opt}</div>)}
    </div>
  );
}
```

**Fix:** Use a properly implemented dropdown with keyboard navigation.

```tsx
// ✅ Correct — keyboard-accessible dropdown
// Use a headless UI library (Radix UI Select) or implement:
// - Arrow keys navigate options
// - Enter/Space selects
// - Escape closes
// - Focus returns to trigger on close
import * as Select from "@radix-ui/react-select";
```

---

## Anti-Pattern 7: Dynamic Content Without Live Regions

**Violation:** WCAG 4.1.3 — Status Messages

```tsx
// ❌ Anti-pattern — status update not announced to screen readers
function RunStatus({ status }: { status: RunStatus }) {
  return <StatusPill status={status} />;
}
```

**Fix:** Wrap dynamic status updates in `aria-live` regions.

```tsx
// ✅ Status changes announced to screen readers
<div aria-live="polite" aria-atomic="true">
  <StatusPill status={run.status} />
</div>

// ✅ Toast notifications use aria-live
<div
  role="status"
  aria-live="polite"
  className="fixed bottom-4 right-4"
>
  {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
</div>
```

---

## Anti-Pattern 8: Tables Without Headers

**Violation:** WCAG 1.3.1 — Info and Relationships

```tsx
// ❌ Anti-pattern — table without semantic headers
<table>
  <tr><td>Run #001</td><td>PENDING</td><td>Zone 3</td></tr>
</table>
```

**Fix:** Always use `<th scope="col">` for column headers.

```tsx
// ✅ Correct table structure
<table>
  <thead>
    <tr>
      <th scope="col">{t("runs:table.id")}</th>
      <th scope="col">{t("runs:table.status")}</th>
      <th scope="col">{t("runs:table.department")}</th>
    </tr>
  </thead>
  <tbody>
    {runs.map(run => (
      <tr key={run.id}>
        <td>{run.id}</td>
        <td><StatusPill status={run.status} /></td>
        <td>{run.departmentId}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Anti-Pattern Summary Table

| Anti-Pattern           | WCAG Criterion | Severity | Fix                              |
|------------------------|----------------|----------|----------------------------------|
| Color-only status      | 1.4.1          | High     | Add text label                   |
| Icon-only button       | 1.1.1, 4.1.2   | High     | Add `aria-label`                 |
| Missing form label     | 1.3.1, 3.3.2   | High     | Use `Input` component            |
| Focus ring removal     | 2.4.7          | High     | Use `focus-visible`              |
| Non-descriptive links  | 2.4.6, 2.4.9   | Medium   | Descriptive text or `aria-label` |
| Keyboard trap          | 2.1.2          | Critical | Proper keyboard handling         |
| No live regions        | 4.1.3          | Medium   | `aria-live="polite"`             |
| Tables without headers | 1.3.1          | High     | `<th scope="col">`               |

---

## Review Checklist

- [ ] All 8 anti-patterns have before/after code examples
- [ ] WCAG criterion is cited for each anti-pattern
- [ ] Severity is assigned to each
- [ ] Summary table is complete and consistent with the detailed entries
