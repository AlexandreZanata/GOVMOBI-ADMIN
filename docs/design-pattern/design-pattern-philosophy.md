# Design Pattern Philosophy — GOVMOBI-ADMIN

> **Cross-links:** [`design-pattern.md`](./design-pattern.md) · [`../design-system/design-system-philosophy.md`](../design-system/design-system-philosophy.md)

---

## Guiding Principles

### 1. Operational Clarity

Admin panel users are professionals under time pressure. Every pattern must reduce cognitive load, not add to it. Patterns that look clever but slow down task completion are rejected.

- Prefer explicit over implicit (show status text, not just color)
- Prefer predictable over novel (consistent placement of actions)
- Prefer dense over sparse (operators need to see more data at once than consumer apps)

### 2. Auditability by Design

Every destructive or state-changing action must make the audit trail visible and the action reversible where possible. Patterns that bypass confirmation or skip audit triggers are forbidden.

- Confirmation dialogs for all destructive actions
- Mandatory reason fields for overrides and cancellations
- Visual history in run detail views

### 3. Role-Aware Progressive Disclosure

Show users what they need for their role. Do not clutter the interface with actions the current user cannot perform. But do not hide context — a Dispatcher should still see that an override happened, even if they cannot perform one.

- Actions are hidden (not disabled) when the user lacks permission
- Context (history, audit entries) is visible to all roles with read access
- Escalation paths are always visible to those who need them

### 4. Fail Safely and Visibly

When something goes wrong, the user must know immediately and have a clear path forward. Silent failures are unacceptable in an operational system.

- Every async operation has a loading state, error state, and success state
- Error messages are actionable (not just "Something went wrong")
- Stale data is indicated, not silently served

### 5. Accessibility Is Not Optional

Patterns that are inaccessible are not acceptable patterns. Every interaction pattern must work with keyboard-only navigation and screen readers.

---

## What Makes a Pattern "Approved"

A pattern is approved for use in GOVMOBI-ADMIN when it:

1. Has a documented use case in this codebase
2. Has a concrete implementation example
3. Passes WCAG 2.1 AA
4. Has defined permission and audit implications
5. Has been reviewed by Engineering Lead and Design Lead

---

## Review Checklist

- [ ] All five principles have concrete "in practice" implications
- [ ] Pattern approval criteria are explicit and checkable
