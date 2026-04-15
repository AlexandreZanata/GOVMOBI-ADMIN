## Phase 0 Assumptions - GOVMOBI-ADMIN

> **Status:** Draft - Pending approval
> **Owner:** Engineering Lead
> **Date:** 2026-04-15
> **Cross-links:** `docs/product/overview.md`, `docs/architecture/system-design.md`, `docs/security.md`, `docs/api-contract.md`

---

## 1. Assumptions

| ID | Assumption                                                                                                            | Why it matters                                                  |
|----|-----------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| A1 | GOVMOBI-ADMIN is an internal operational admin panel, not a public consumer app.                                      | Defines security posture, UX decisions, and audit requirements. |
| A2 | Core run lifecycle is fixed for v1: `PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED/CANCELLED`.                      | Drives status UI, API transitions, and analytics logic.         |
| A3 | Role model includes `Admin`, `Supervisor`, `Dispatcher`, `Analyst (optional)`, and `Field Agent (read-only context)`. | Sets permission boundaries and visibility rules.                |
| A4 | Frontend permission checks are UX gates only; server-side RBAC is authoritative.                                      | Prevents false security assumptions in client code.             |
| A5 | Authentication is external (SSO/OAuth2) with JWT in `httpOnly` cookies.                                               | Impacts session handling, API auth behavior, and storage rules. |
| A6 | Documentation in `docs/` is implementation-oriented and auditable.                                                    | Establishes documentation quality and review expectations.      |
| A7 | Development and test rely on MSW parity with API contract behavior.                                                   | Keeps frontend progress independent from backend readiness.     |
| A8 | Engineering conventions use strict TypeScript, App Router architecture, and layered boundaries.                       | Reduces architectural drift and review ambiguity.               |

---

## 2. Unknowns

| ID  | Open question                                                                         | Impact if unresolved                                              | Owner                 |
|-----|---------------------------------------------------------------------------------------|-------------------------------------------------------------------|-----------------------|
| OQ1 | Is `Analyst` fully in scope for v1 or gated for later release?                        | Permissions, routes, and report docs may be over/under specified. | Product + Engineering |
| OQ2 | Which compliance framework must be mapped explicitly (if any)?                        | Affects security controls, evidence, and audit process design.    | Security + Compliance |
| OQ3 | What is the final API stability level (`draft` vs `version-locked`) for v1 endpoints? | Impacts migration guidance and breaking-change policy.            | Backend + Engineering |
| OQ4 | What are final SLA/SLO targets for dashboard and list endpoints?                      | Affects performance budgets and observability gates.              | Product + DevOps      |
| OQ5 | What legal/data-policy baseline is mandatory for this deployment?                     | Impacts retention, masking, and cross-environment data handling.  | Legal + Security      |

---

## 3. Risks

| ID | Risk                                                                 | Probability | Impact | Mitigation                                                             |
|----|----------------------------------------------------------------------|-------------|--------|------------------------------------------------------------------------|
| R1 | Permission rules drift between UI gates and API enforcement.         | Medium      | High   | Keep permission matrix centralized and validate with role-based tests. |
| R2 | Documentation and implementation diverge over time.                  | Medium      | High   | Add doc ownership and review checklist to PR process.                  |
| R3 | API contract changes without migration notes.                        | Medium      | High   | Enforce ADR + versioning notes for endpoint contract changes.          |
| R4 | Audit trail coverage misses state-changing edge cases.               | Low         | High   | Add mandatory audit verification in testing and security reviews.      |
| R5 | Terminology inconsistency across docs creates operational confusion. | Medium      | Medium | Maintain canonical glossary and cross-link authoritative sections.     |

---

## 4. Proposed Terminology Glossary

| Term               | Canonical meaning                                                         |
|--------------------|---------------------------------------------------------------------------|
| Run                | Primary operational unit managed by the admin panel.                      |
| Run lifecycle      | `PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED/CANCELLED`.              |
| Override           | Authorized exception action that changes standard run progression.        |
| Approval           | Explicit decision gate for privileged actions.                            |
| RBAC               | Server-enforced role-based permission model.                              |
| Permission         | Atomic capability string (for example: `run:override`).                   |
| Audit event        | Immutable record of a state-changing action and actor metadata.           |
| Supervisor         | Oversight role with approval authority within defined scope.              |
| Dispatcher         | Operational role for creating/assigning/managing runs.                    |
| Analyst            | Reporting-focused role with restricted mutation capability.               |
| Definition of Done | Minimum release quality gate including tests, security, docs, and review. |

---

## 5. Approval Checkpoint

This file is considered accepted when all conditions are met:

- [ ] Product confirms scope and role definitions.
- [ ] Engineering confirms architecture and lifecycle assumptions.
- [ ] Security confirms RBAC, audit, and auth assumptions.
- [ ] Open questions have owners and target resolution dates.
- [ ] Canonical glossary terms are reused in all authoritative docs.

Approval notes:

- Approved by:
- Date:
- Decision:

