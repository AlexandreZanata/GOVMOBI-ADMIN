# Architecture Decision Records — GOVMOBI-ADMIN

> **Owner:** Engineering Lead
> **Cross-links:** [`../architecture/system-design.md`](../architecture/system-design.md)

---

## What is an ADR?

An Architecture Decision Record (ADR) captures a significant technical decision: the context that led to it, the decision itself, the alternatives considered, and the consequences. ADRs are immutable once accepted — they are never edited to change the decision. If a decision is reversed, a new ADR is written.

---

## ADR Index

| ADR                                           | Title                                   | Status   |
|-----------------------------------------------|-----------------------------------------|----------|
| [ADR-001](./adr-001-facade-pattern.md)        | Facade Pattern as API Abstraction Layer | Accepted |
| [ADR-002](./adr-002-atomic-design.md)         | Atomic Design as Component Architecture | Accepted |
| [ADR-003](./adr-003-client-state-strategy.md) | Client State: Zustand + TanStack Query  | Accepted |

---

## ADR Statuses

| Status         | Meaning                                 |
|----------------|-----------------------------------------|
| **Proposed**   | Under discussion; not yet decided       |
| **Accepted**   | Decision made and in effect             |
| **Deprecated** | Was accepted; superseded by a newer ADR |
| **Superseded** | Replaced by ADR-XXX                     |

---

## How to Propose a New ADR

1. Copy the template below into a new file: `adr-{NNN}-{short-title}.md`
2. Fill in all sections — leave none blank
3. Open a PR with the ADR file and at minimum 2 reviewers (Engineering Lead + one affected engineer)
4. Discussion happens in the PR
5. Once approved, status changes to **Accepted** and the ADR is merged

### ADR Template

```markdown
# ADR-NNN: [Title]

> **Status:** Proposed | Accepted | Deprecated | Superseded by ADR-XXX
> **Date:** YYYY-MM-DD
> **Deciders:** [Names or roles]
> **Cross-links:** [Related docs]

## Context
[What is the situation that requires a decision? What forces are at play?]

## Decision
[What was decided? State it clearly and directly.]

## Rationale
[Why was this decision made over the alternatives?]

## Alternatives Considered
### Option A: [Name]
[Description, pros, cons]

### Option B: [Name]
[Description, pros, cons]

## Consequences
### Positive
- 

### Negative / Trade-offs
- 

### Risks
- 

## Compliance
[How does this decision affect engineering standards, testing, security?]

## Review Checklist
- [ ] Context is clear and complete
- [ ] Decision is stated unambiguously
- [ ] All alternatives were genuinely considered
- [ ] Consequences include trade-offs, not just benefits
```
