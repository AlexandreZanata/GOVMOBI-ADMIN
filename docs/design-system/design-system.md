# Design System — GOVMOBI-ADMIN

> **Status:** Authoritative
> **Owner:** Design Lead + Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`design-system-tokens.md`](./design-system-tokens.md) · [`design-system-components.md`](./design-system-components.md) · [`design-system-accessibility.md`](./design-system-accessibility.md) · [`../engineering-standards.md`](../engineering-standards.md)

---

## Overview

The GovMobile design system is a **token-driven, accessibility-first** component library built specifically for internal government operations. It is not a general-purpose UI kit — every decision is made in the context of operational clarity, auditability, and role-aware interfaces.

The design system lives in:
- **Tokens:** `src/theme/tokens.ts` + `src/theme/govmobile.css`
- **Components:** `src/components/atoms/` (and molecules/organisms as they are built)
- **Documentation:** `docs/design-system/`

---

## Sub-Documents

| Document                                                                 | Purpose                                           |
|--------------------------------------------------------------------------|---------------------------------------------------|
| [`design-system-philosophy.md`](./design-system-philosophy.md)           | Guiding principles behind every design decision   |
| [`design-system-quick-reference.md`](./design-system-quick-reference.md) | One-page cheat sheet for daily use                |
| [`design-system-tokens.md`](./design-system-tokens.md)                   | Complete token reference                          |
| [`design-system-theme-reference.md`](./design-system-theme-reference.md) | Tailwind v4 `@theme` and CSS variable conventions |
| [`design-system-components.md`](./design-system-components.md)           | Component API contracts                           |
| [`design-system-accessibility.md`](./design-system-accessibility.md)     | A11y requirements and testing checklist           |
| [`design-system-ai-guidelines.md`](./design-system-ai-guidelines.md)     | AI assistant usage constraints                    |

---

## Governance

### Who Can Change the Design System

| Change Type             | Requires                                                        |
|-------------------------|-----------------------------------------------------------------|
| New token               | Design Lead approval + Engineering Lead review                  |
| Token value change      | Design Lead approval + Engineering Lead review + migration note |
| New atom component      | Engineering Lead review + design review                         |
| Atom API change (props) | Engineering Lead review + update to design-system-components.md |
| New molecule/organism   | Feature PR review (standard process)                            |

### Change Process

1. Propose the change in a PR with updated documentation.
2. Tag the appropriate reviewers (see table above).
3. If a token value changes, include a migration note listing all affected components.
4. Merge only after all reviewers approve.

### What Is Forbidden Without Approval

- Adding a new color that is not a token
- Changing a token value without a migration note
- Adding a new component variant without updating `design-system-components.md`
- Removing a token that is in use

---

## Implementation Status

| Component             | Status     | Location                                 |
|-----------------------|------------|------------------------------------------|
| Button                | ✅ Complete | `src/components/atoms/Button.tsx`        |
| Badge                 | ✅ Complete | `src/components/atoms/Badge.tsx`         |
| Input                 | ✅ Complete | `src/components/atoms/Input.tsx`         |
| Avatar                | ✅ Complete | `src/components/atoms/Avatar.tsx`        |
| StatusPill            | ✅ Complete | `src/components/atoms/StatusPill.tsx`    |
| Can (permission gate) | 🔲 Planned | `src/components/atoms/Can.tsx`           |
| Toast                 | 🔲 Planned | `src/components/atoms/Toast.tsx`         |
| Modal                 | 🔲 Planned | `src/components/molecules/Modal.tsx`     |
| FormField             | 🔲 Planned | `src/components/molecules/FormField.tsx` |
| RunTable              | 🔲 Planned | `src/components/organisms/RunTable.tsx`  |

---

## Review Checklist

- [ ] All sub-documents are listed and linked
- [ ] Governance rules define who can make each type of change
- [ ] Implementation status table is current
- [ ] Forbidden changes are explicit
