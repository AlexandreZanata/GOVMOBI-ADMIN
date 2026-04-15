# Design Patterns — GOVMOBI-ADMIN

> **Status:** Authoritative
> **Owner:** Engineering Lead + Design Lead
> **Cross-links:** [`design-pattern-philosophy.md`](./design-pattern-philosophy.md) · [`design-pattern-quick-reference.md`](./design-pattern-quick-reference.md) · [`../design-system/design-system.md`](../design-system/design-system.md)

---

## Pattern Index

| Document                                                                                           | Covers                                                                 |
|----------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| [`design-pattern-philosophy.md`](./design-pattern-philosophy.md)                                   | Guiding principles behind all patterns                                 |
| [`design-pattern-quick-reference.md`](./design-pattern-quick-reference.md)                         | One-page cheat sheet                                                   |
| [`design-pattern-interactions.md`](./design-pattern-interactions.md)                               | Confirmation dialogs, bulk actions, inline editing, optimistic updates |
| [`design-pattern-loading-gestures.md`](./design-pattern-loading-gestures.md)                       | Skeletons, spinners, progress, stale data                              |
| [`design-pattern-motion-navigation.md`](./design-pattern-motion-navigation.md)                     | Page transitions, drawer/modal animation, navigation feedback          |
| [`design-pattern-performance.md`](./design-pattern-performance.md)                                 | Code splitting, virtualization, memoization, bundle budgets            |
| [`design-pattern-accessibility-anti-patterns.md`](./design-pattern-accessibility-anti-patterns.md) | Known a11y anti-patterns with before/after fixes                       |

---

## Pattern Categories

### Interaction Patterns
Patterns for how users interact with data and trigger actions. Covers the full lifecycle of a user action: trigger → confirmation → execution → feedback.

### Loading Patterns
Patterns for communicating async state. Every data-fetching operation must use one of the approved loading patterns.

### Navigation Patterns
Patterns for moving between views, opening modals, and providing navigation feedback.

### Performance Patterns
Patterns for keeping the UI fast and responsive under real operational load.

### Accessibility Anti-Patterns
Known violations and their correct alternatives. Used in code review and QA.

---

## When to Add a New Pattern

A new pattern should be documented when:
1. The same UI problem is solved in more than one place
2. A new interaction type is introduced (e.g. bulk actions, drag-and-drop)
3. A pattern is identified as an anti-pattern and needs a documented alternative

**Process:** Open a PR with the new pattern documented in the appropriate sub-file. Tag Engineering Lead and Design Lead for review.

---

## Review Checklist

- [ ] All sub-documents are listed and linked
- [ ] Pattern categories are clearly defined
- [ ] Process for adding new patterns is documented
