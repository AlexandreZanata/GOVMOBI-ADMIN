# GOVMOBI-ADMIN — Documentation Index

> **Product:** GovMobile Admin Panel
> **Type:** Internal frontend admin panel for government operations
> **Stack:** Next.js 16 · React 19 · TypeScript strict · Tailwind v4 · TanStack Query · Zustand · MSW · Vitest
> **Last reviewed:** See git log
> **Owner:** Engineering Lead + Product Lead (joint)

---

## How to Use This Documentation

This index is the entry point for all project documentation. Every file has a defined audience and purpose. Start here, then follow the cross-links relevant to your role.

### By Role

| Role                        | Start Here                                                                                       | Also Read                                                                                                                                                                                                          |
|-----------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Engineer (new)**          | This file → [`engineering-standards.md`](./engineering-standards.md)                             | [`architecture/system-design.md`](./architecture/system-design.md), [`decisions/README.md`](./decisions/README.md)                                                                                                 |
| **Engineer (feature work)** | [`engineering-standards.md`](./engineering-standards.md)                                         | [`api-contract.md`](./api-contract.md), [`design-system/design-system.md`](./design-system/design-system.md), [`design-pattern/design-pattern.md`](./design-pattern/design-pattern.md)                             |
| **Product Manager**         | [`product/overview.md`](./product/overview.md)                                                   | [`product/use-cases.md`](./product/use-cases.md), [`ux/flows.md`](./ux/flows.md)                                                                                                                                   |
| **Designer**                | [`design-system/design-system-philosophy.md`](./design-system/design-system-philosophy.md)       | [`design-system/design-system-tokens.md`](./design-system/design-system-tokens.md), [`design-pattern/design-pattern-philosophy.md`](./design-pattern/design-pattern-philosophy.md), [`ux/flows.md`](./ux/flows.md) |
| **QA Engineer**             | [`testing-strategy.md`](./testing-strategy.md)                                                   | [`product/use-cases.md`](./product/use-cases.md), [`api-contract.md`](./api-contract.md)                                                                                                                           |
| **DevOps / Platform**       | [`devops.md`](./devops.md)                                                                       | [`security.md`](./security.md), [`testing-strategy.md`](./testing-strategy.md)                                                                                                                                     |
| **Security / Compliance**   | [`security.md`](./security.md)                                                                   | [`product/use-cases.md`](./product/use-cases.md), [`api-contract.md`](./api-contract.md), [`devops.md`](./devops.md)                                                                                               |
| **Operations Supervisor**   | [`product/overview.md`](./product/overview.md)                                                   | [`ux/flows.md`](./ux/flows.md), [`product/use-cases.md`](./product/use-cases.md)                                                                                                                                   |
| **AI Coding Assistant**     | [`design-system/design-system-ai-guidelines.md`](./design-system/design-system-ai-guidelines.md) | [`implementation/ai-driver-dispatcher-prompt-guide.md`](./implementation/ai-driver-dispatcher-prompt-guide.md), [`engineering-standards.md`](./engineering-standards.md)                                           |

---

## Full Documentation Map

### Product

| File                                             | Purpose                                                            | Audience                      |
|--------------------------------------------------|--------------------------------------------------------------------|-------------------------------|
| [`product/overview.md`](./product/overview.md)   | Problem statement, scope, non-goals, stakeholders, success metrics | PM, Engineering, Stakeholders |
| [`product/use-cases.md`](./product/use-cases.md) | Role-based use cases with flows, permissions, edge cases           | PM, QA, Engineering, Security |

### Architecture

| File                                                                                         | Purpose                                                              | Audience            |
|----------------------------------------------------------------------------------------------|----------------------------------------------------------------------|---------------------|
| [`architecture/system-design.md`](./architecture/system-design.md)                           | Frontend architecture, module boundaries, state strategy, data flows | Engineering, DevOps |
| [`decisions/README.md`](./decisions/README.md)                                               | ADR index and process                                                | Engineering         |
| [`decisions/adr-001-facade-pattern.md`](./decisions/adr-001-facade-pattern.md)               | Facade pattern decision                                              | Engineering         |
| [`decisions/adr-002-atomic-design.md`](./decisions/adr-002-atomic-design.md)                 | Atomic design decision                                               | Engineering, Design |
| [`decisions/adr-003-client-state-strategy.md`](./decisions/adr-003-client-state-strategy.md) | Zustand + TanStack Query state decision                              | Engineering         |

### Engineering

| File                                                     | Purpose                                                | Audience                  |
|----------------------------------------------------------|--------------------------------------------------------|---------------------------|
| [`engineering-standards.md`](./engineering-standards.md) | TypeScript, lint, folder conventions, review standards | Engineering               |
| [`testing-strategy.md`](./testing-strategy.md)           | Test pyramid, tooling, coverage, test matrix           | Engineering, QA           |
| [`api-contract.md`](./api-contract.md)                   | REST API contract, error model, auth                   | Engineering, QA, Security |
| [`git-workflow.md`](./git-workflow.md)                   | Branching model, PR rules, merge strategy              | Engineering               |
| [`commit-rules.md`](./commit-rules.md)                   | Conventional Commits format and scopes                 | Engineering               |

### Operations & Security

| File                           | Purpose                                            | Audience                      |
|--------------------------------|----------------------------------------------------|-------------------------------|
| [`security.md`](./security.md) | RBAC, audit logs, threat model, compliance         | Security, Engineering, DevOps |
| [`devops.md`](./devops.md)     | Environments, CI/CD, release, rollback, monitoring | DevOps, Engineering           |

### Design System

| File                                                                                                 | Purpose                                 | Audience                |
|------------------------------------------------------------------------------------------------------|-----------------------------------------|-------------------------|
| [`design-system/design-system.md`](./design-system/design-system.md)                                 | Master design system reference          | Engineering, Design     |
| [`design-system/design-system-philosophy.md`](./design-system/design-system-philosophy.md)           | Design principles                       | Design, Engineering     |
| [`design-system/design-system-quick-reference.md`](./design-system/design-system-quick-reference.md) | Token + component cheat sheet           | Engineering, Design     |
| [`design-system/design-system-components.md`](./design-system/design-system-components.md)           | Component API contracts                 | Engineering, Design, QA |
| [`design-system/design-system-theme-reference.md`](./design-system/design-system-theme-reference.md) | Tailwind v4 theme + CSS variables       | Engineering             |
| [`design-system/design-system-tokens.md`](./design-system/design-system-tokens.md)                   | Full token reference                    | Engineering, Design     |
| [`design-system/design-system-accessibility.md`](./design-system/design-system-accessibility.md)     | A11y requirements for the design system | Engineering, Design, QA |
| [`design-system/design-system-ai-guidelines.md`](./design-system/design-system-ai-guidelines.md)     | AI assistant usage constraints          | Engineering, AI tools   |

### Design Patterns

| File                                                                                                                             | Purpose                          | Audience                |
|----------------------------------------------------------------------------------------------------------------------------------|----------------------------------|-------------------------|
| [`design-pattern/design-pattern.md`](./design-pattern/design-pattern.md)                                                         | Pattern master index             | Engineering, Design     |
| [`design-pattern/design-pattern-philosophy.md`](./design-pattern/design-pattern-philosophy.md)                                   | Pattern principles               | Engineering, Design     |
| [`design-pattern/design-pattern-quick-reference.md`](./design-pattern/design-pattern-quick-reference.md)                         | Pattern cheat sheet              | Engineering             |
| [`design-pattern/design-pattern-accessibility-anti-patterns.md`](./design-pattern/design-pattern-accessibility-anti-patterns.md) | A11y anti-patterns with fixes    | Engineering, Design, QA |
| [`design-pattern/design-pattern-interactions.md`](./design-pattern/design-pattern-interactions.md)                               | Interaction patterns             | Engineering, Design     |
| [`design-pattern/design-pattern-loading-gestures.md`](./design-pattern/design-pattern-loading-gestures.md)                       | Loading state patterns           | Engineering             |
| [`design-pattern/design-pattern-motion-navigation.md`](./design-pattern/design-pattern-motion-navigation.md)                     | Motion and navigation patterns   | Engineering, Design     |
| [`design-pattern/design-pattern-performance.md`](./design-pattern/design-pattern-performance.md)                                 | Performance patterns and budgets | Engineering, DevOps     |

### Implementation & UX

| File                                                                                                           | Purpose                                        | Audience                    |
|----------------------------------------------------------------------------------------------------------------|------------------------------------------------|-----------------------------|
| [`implementation/ai-driver-dispatcher-prompt-guide.md`](./implementation/ai-driver-dispatcher-prompt-guide.md) | AI prompt templates for feature implementation | Engineering, AI tools       |
| [`implementation/frota-motoristas-next-steps.md`](./implementation/frota-motoristas-next-steps.md)             | Steps + prompts for `/frota/motoristas` rollout | Engineering, AI tools     |
| [`implementation/routes/README.md`](./implementation/routes/README.md)                                           | Route-by-route implementation guide index      | Engineering                 |
| [`ux/flows.md`](./ux/flows.md)                                                                                 | End-to-end admin workflow descriptions         | PM, Design, Engineering, QA |

---

## Change Management

### Ownership

| Doc Section           | Primary Owner      | Reviewer                         |
|-----------------------|--------------------|----------------------------------|
| Product docs          | Product Lead       | Engineering Lead                 |
| Architecture docs     | Engineering Lead   | Senior Engineers                 |
| Design system         | Design Lead        | Engineering Lead                 |
| Security docs         | Security Lead      | Engineering Lead, DevOps         |
| DevOps docs           | DevOps Lead        | Engineering Lead                 |
| Engineering standards | Engineering Lead   | All Engineers (consensus)        |
| ADRs                  | Proposing Engineer | Engineering Lead + affected team |

### Update Process

1. **Minor updates** (typos, clarifications, examples): PR with single reviewer from the owning team.
2. **Substantive updates** (new rules, changed patterns, updated contracts): PR with owner + one cross-functional reviewer. Add a changelog entry at the bottom of the affected file.
3. **Breaking changes** (new ADR, permission matrix change, API contract change): Requires owner sign-off + Engineering Lead approval. Must include a migration note if existing code is affected.

### Doc Review in PRs

Every feature PR must confirm:
- [ ] Affected docs are updated or explicitly noted as "no doc change required"
- [ ] New patterns or decisions are captured in the appropriate doc
- [ ] No hardcoded values, role names, or terminology that contradicts the glossary

---

## Terminology

All role names, entity names, and lifecycle states used across this documentation are defined in the [Phase 0 Glossary](../PHASE0-ASSUMPTIONS.md) and enforced in [`engineering-standards.md`](./engineering-standards.md).

**Canonical terms (never deviate):**

| Use                                                      | Never use                      |
|----------------------------------------------------------|--------------------------------|
| Run                                                      | Task, Job, Assignment, Ticket  |
| Field Agent                                              | Driver, Worker, Employee       |
| Dispatcher                                               | Operator, Coordinator          |
| Supervisor                                               | Manager, Lead                  |
| PENDING / ASSIGNED / IN_PROGRESS / COMPLETED / CANCELLED | Any other status names         |
| Facade                                                   | Service, Repository, API layer |
| Permission Gate                                          | Auth guard, Role check         |

---

## Review Checklist

- [ ] All 33 doc files are present and non-empty
- [ ] Every file listed in the map above exists at the correct path
- [ ] Role-to-doc mapping covers all five roles
- [ ] Ownership table is complete and agreed upon
- [ ] Terminology table matches the Phase 0 glossary
- [ ] Change management process is understood by the team
