# Design System Accessibility — GOVMOBI-ADMIN

> **Standard:** WCAG 2.1 AA (Mandatory)
> **Cross-links:** [`design-system-components.md`](./design-system-components.md) · [`../design-pattern/design-pattern-accessibility-anti-patterns.md`](../design-pattern/design-pattern-accessibility-anti-patterns.md) · [`../testing-strategy.md`](../testing-strategy.md)

---

## 1. Color Contrast Requirements

All text must meet WCAG 2.1 AA contrast ratios:

| Text Type                           | Minimum Ratio  | Verified Against |
|-------------------------------------|----------------|------------------|
| Normal text (< 18pt)                | 4.5:1          | Background color |
| Large text (≥ 18pt or 14pt bold)    | 3:1            | Background color |
| UI components and graphical objects | 3:1            | Adjacent colors  |
| Disabled elements                   | No requirement | —                |

### Token Contrast Verification

| Foreground Token | Background Token | Ratio  | Pass/Fail |
|------------------|------------------|--------|-----------|
| `neutral-900`    | `neutral-50`     | ~15:1  | ✅ Pass    |
| `brand-primary`  | `white`          | ~5.2:1 | ✅ Pass    |
| `success` text   | `success/15` bg  | ~4.8:1 | ✅ Pass    |
| `warning` text   | `warning/15` bg  | ~4.6:1 | ✅ Pass    |
| `danger` text    | `danger/15` bg   | ~5.1:1 | ✅ Pass    |
| `info` text      | `info/15` bg     | ~4.7:1 | ✅ Pass    |

> **Note:** Contrast ratios must be re-verified if token HSL values change.

---

## 2. Focus Management

### Focus Ring Requirements

- All interactive elements must have a visible focus ring.
- Focus ring must be visible against both light and dark backgrounds.
- Focus ring must not be removed via `outline: none` without a replacement.

- ✅ Correct (Tailwind utility classes): `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2`
- ❌ Forbidden (no replacement focus style): `:focus { outline: none; }`

### Focus Order

- Tab order must follow the visual reading order (left-to-right, top-to-bottom).
- Modal dialogs must trap focus within the modal while open.
- On modal close, focus must return to the element that triggered the modal.
- Skip-to-main-content link must be the first focusable element on every page.

---

## 3. ARIA Patterns

### Required ARIA by Component Type

| Component        | Required ARIA                                                |
|------------------|--------------------------------------------------------------|
| Icon-only button | `aria-label` describing the action                           |
| Loading button   | `aria-busy="true"`                                           |
| Error message    | `role="alert"`                                               |
| Invalid input    | `aria-invalid="true"` + `aria-describedby` pointing to error |
| Modal dialog     | `role="dialog"` + `aria-modal="true"` + `aria-labelledby`    |
| Status pill      | `aria-label` with the text label (not just color)            |
| Avatar           | `role="img"` + `aria-label` with the person's name           |
| Data table       | `<th scope="col">` for column headers                        |
| Sortable column  | `aria-sort="ascending                                        |descending|none"` |

### Live Regions

Use `aria-live` for dynamic content updates:

```tsx
// ✅ Toast notifications
<div aria-live="polite" aria-atomic="true">
  {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
</div>

// ✅ Run status update
<span aria-live="polite">
  <StatusPill status={run.status} />
</span>

// ❌ Do not use aria-live="assertive" except for critical errors
```

---

## 4. Keyboard Navigation

### Required Keyboard Support

| Interaction                   | Key                 | Behavior                    |
|-------------------------------|---------------------|-----------------------------|
| Navigate interactive elements | `Tab` / `Shift+Tab` | Move focus forward/backward |
| Activate button               | `Enter` or `Space`  | Trigger click               |
| Close modal                   | `Escape`            | Close and return focus      |
| Navigate dropdown             | `Arrow Up/Down`     | Move between options        |
| Select dropdown option        | `Enter`             | Select and close            |
| Navigate table rows           | `Arrow Up/Down`     | Move between rows           |

### Keyboard Traps

- Modals must trap focus (Tab cycles within the modal).
- Dropdowns must trap focus while open.
- After closing a modal or dropdown, focus returns to the trigger element.

---

## 5. Status Communication

**Never communicate status through color alone.** Always use at least two of:
- Color
- Text label
- Icon

```tsx
// ✅ Color + text (StatusPill)
<StatusPill status={RunStatus.COMPLETED} />
// Renders: green background + "Completed" text

// ❌ Color only
<span className="bg-success w-3 h-3 rounded-full" />

// ✅ Color + icon + text (for critical states)
<span className="text-danger flex items-center gap-1">
  <AlertIcon aria-hidden="true" />
  {t("runs:status.CANCELLED")}
</span>
```

---

## 6. Form Accessibility

```tsx
// ✅ Every input has an associated label
<Input
  id="run-title"
  label={t("runs:form.title")}
  error={errors.title?.message}
/>

// ✅ Required fields are indicated
<Input
  label={`${t("runs:form.title")} *`}
  aria-required="true"
/>

// ✅ Error messages are announced
// Input component sets role="alert" on error paragraph automatically

// ❌ Placeholder as label substitute
<input placeholder="Enter run title" />
```

---

## 7. Accessibility Testing Checklist

### Automated (Run in CI)

- [ ] `@axe-core/react` or `axe-playwright` — zero violations on all pages
- [ ] Color contrast check via design token verification
- [ ] `aria-label` presence on all icon-only buttons

### Manual (Pre-release)

- [ ] Keyboard-only navigation through all critical flows (run assignment, override, user management)
- [ ] Screen reader test (NVDA + Chrome or VoiceOver + Safari) on all pages
- [ ] Focus management verified in all modals and dialogs
- [ ] Status pill colors verified against WCAG contrast ratios
- [ ] Skip-to-main-content link present and functional
- [ ] All form errors announced by screen reader

### Tools

| Tool                             | Purpose                         |
|----------------------------------|---------------------------------|
| axe DevTools (browser extension) | Manual page audit               |
| `@axe-core/playwright`           | Automated E2E a11y testing      |
| Colour Contrast Analyser         | Token contrast verification     |
| NVDA + Chrome                    | Screen reader testing (Windows) |
| VoiceOver + Safari               | Screen reader testing (macOS)   |

---

## Review Checklist

- [ ] Contrast ratios are documented for all token combinations
- [ ] Focus ring requirements are explicit with forbidden patterns
- [ ] ARIA patterns table covers all component types
- [ ] Keyboard navigation requirements are complete
- [ ] Status communication rule (never color alone) is documented
- [ ] Testing checklist distinguishes automated from manual
