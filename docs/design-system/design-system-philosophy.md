# Design System Philosophy — GOVMOBI-ADMIN

> **Cross-links:** [`design-system.md`](./design-system.md) · [`design-system-tokens.md`](./design-system-tokens.md) · [`../design-pattern/design-pattern-philosophy.md`](../design-pattern/design-pattern-philosophy.md)

---

## Core Principles

### 1. Operational Clarity Over Aesthetic Novelty

This is an internal operational tool used under time pressure by government staff. Every visual decision must serve operational clarity first. Decorative elements, complex animations, and trendy UI patterns are rejected if they slow down task completion or increase cognitive load.

**In practice:**
- Status indicators use both color AND text (never color alone)
- Information density is higher than consumer apps — operators need to see more at once
- Primary actions are always visually dominant and immediately findable
- Destructive actions (cancel, override, deactivate) are visually distinct but not hidden

### 2. Token-Driven Consistency

Every color, spacing, radius, and typography value comes from a named token. No hardcoded values anywhere in the codebase. This ensures:
- Visual consistency across all components
- Easy theme updates (change one token, update everywhere)
- Auditability (every visual decision is traceable to a token)

**In practice:**
- `bg-brand-primary` not `bg-[#1a56db]`
- `rounded-[var(--radius-md)]` not `rounded-lg` (unless `--radius-md` maps to `lg`)
- All status colors come from semantic tokens: `success`, `warning`, `danger`, `info`

### 3. Accessibility First

WCAG 2.1 AA is a non-negotiable requirement, not a post-launch consideration. Every component is designed with accessibility as a primary constraint, not an afterthought.

**In practice:**
- Color contrast ratios are verified at the token level
- All interactive elements have visible focus rings
- Status is communicated via text + color + icon (never color alone)
- All form fields have associated labels
- All icon-only buttons have `aria-label`

### 4. Role-Aware Design

The admin panel serves multiple roles with different permissions and workflows. The design system supports role-aware rendering through the `<Can />` component and `usePermissions()` hook — but the visual language itself is consistent across roles. A Supervisor and a Dispatcher see the same components; they just see different actions available.

**In practice:**
- Components do not have "admin variant" or "supervisor variant" — they have permission gates
- Disabled states are used when an action exists but is not available (not when it should be hidden entirely)
- Hidden actions (via `<Can />`) leave no visual gap — layouts adapt gracefully

### 5. Predictable, Not Surprising

Operators rely on muscle memory. Components must behave consistently and predictably. A button that looks the same must always do the same type of thing. A status color must always mean the same thing.

**In practice:**
- `danger` variant always means destructive or irreversible
- `StatusPill` colors are fixed per status — never customizable per instance
- Loading states always use the same skeleton/spinner pattern
- Error states always appear in the same location relative to their trigger

---

## What the Design System Is Not

- It is **not** a general-purpose component library (it is purpose-built for this product)
- It is **not** a design tool (it is the implementation of design decisions)
- It is **not** optional (all UI must use design system components and tokens)
- It is **not** frozen (it evolves, but through a governed process)

---

## Review Checklist

- [ ] All five principles are actionable (each has "In practice" examples)
- [ ] Principles are specific to the admin panel context, not generic
- [ ] "What it is not" section sets clear boundaries
