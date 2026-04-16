# Product Overview — GOVMOBI-ADMIN

> **Status:** Authoritative
> **Owner:** Product Lead
> **Last reviewed:** See git log
> **Cross-links:** [`use-cases.md`](./use-cases.md) · [`../architecture/system-design.md`](../architecture/system-design.md) · [`../security.md`](../security.md) · [`../ux/flows.md`](../ux/flows.md)

---

## 1. Problem Statement

Government field operations currently lack a unified, real-time administrative interface for managing operational runs, field agents, and departmental workflows. Supervisors and dispatchers rely on fragmented tools — spreadsheets, phone calls, and disconnected systems — resulting in:

- Delayed run assignments and status visibility gaps
- No centralized audit trail for operational decisions
- Manual, error-prone permission and user management
- No structured escalation or override process for exceptions
- Inability to generate operational reports without data exports

**GOVMOBI-ADMIN** is the internal web-based admin panel that solves these problems by providing a single, role-aware operational platform for government operations staff.

---

## 2. Scope

### In Scope (v1)

| Domain                    | Capabilities                                                                                       |
|---------------------------|----------------------------------------------------------------------------------------------------|
| **Run Management**        | Create, view, assign, monitor, override, and cancel runs across the full lifecycle                 |
| **User Management**       | Create, edit, deactivate, and assign roles to users (Admin, Supervisor, Dispatcher, Field Agent)   |
| **Department Management** | Create and manage departments; assign users and runs to departments                                |
| **Permission Management** | Assign and revoke roles; view effective permissions per user                                       |
| **Audit Trail**           | View server-side audit logs for all state-changing actions                                         |
| **Operational Dashboard** | Real-time overview of run statuses, agent availability, and department activity                    |
| **Basic Reporting**       | Tabular and summary reports for run completion rates, agent performance, and department throughput |
| **Exception Handling**    | Supervisor override of run status; escalation flagging; incident notes                             |

### Out of Scope (v1)

| Item                               | Reason / Future Version                                   |
|------------------------------------|-----------------------------------------------------------|
| Field Agent mobile app             | Separate product (GOVMOBI-APP)                            |
| Advanced analytics / BI dashboards | v2 — requires Analyst role and data warehouse integration |
| Automated run scheduling / routing | v2 — requires optimization engine                         |
| Multi-language support             | Architecture supports it; content deferred to v2          |
| Offline capability                 | Not required for admin panel use case                     |
| Public-facing APIs                 | Admin panel is internal only                              |
| Email / SMS notifications          | v2 — notification service not yet available               |
| Custom report builder              | v2                                                        |

---

## 3. Stakeholders

| Stakeholder                      | Role in Product       | Primary Concerns                                           |
|----------------------------------|-----------------------|------------------------------------------------------------|
| **Operations Director**          | Executive sponsor     | Operational visibility, compliance, audit readiness        |
| **Field Operations Supervisors** | Primary end users     | Run oversight, exception handling, team performance        |
| **Dispatchers**                  | Primary end users     | Run creation, assignment speed, agent availability         |
| **IT / Platform Team**           | Infrastructure owners | Security, deployment, uptime, integration                  |
| **Security / Compliance**        | Governance            | RBAC correctness, audit trail completeness, data handling  |
| **Engineering Team**             | Builders              | Architecture clarity, maintainability, testability         |
| **Product Team**                 | Owners                | Feature completeness, user satisfaction, delivery velocity |
| **QA Team**                      | Quality gate          | Test coverage, regression prevention, acceptance criteria  |

---

## 4. Core Actors and Permissions Summary

> Full permission matrix is in [`../security.md`](../security.md). This is a summary for product context.

| Actor                        | Description           | Key Capabilities                                                                      |
|------------------------------|-----------------------|---------------------------------------------------------------------------------------|
| **Admin**                    | Full platform control | All operations; user/role/department management; audit access                         |
| **Supervisor**               | Operational oversight | View all runs; approve/override/escalate; view audit trail; manage their department   |
| **Dispatcher**               | Run operations        | Create/assign/monitor runs in their department; cannot override or access audit trail |
| **Analyst** *(optional, v2)* | Reporting only        | Read-only access to reports and KPIs; no operational write access                     |
| **Field Agent**              | Mobile-side actor     | Managed in admin panel (profile, assignment) but does not log into this panel         |

---

## 5. Core Entity: The Run

The **Run** is the central operational unit of the platform.

### Lifecycle

```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
                  ↘              ↘
                   CANCELLED      CANCELLED
```

| Status        | Description                                  | Who Can Transition             |
|---------------|----------------------------------------------|--------------------------------|
| `PENDING`     | Run created, not yet assigned                | Created by Dispatcher or Admin |
| `ASSIGNED`    | Run assigned to a Field Agent                | Dispatcher, Admin              |
| `IN_PROGRESS` | Field Agent has accepted and started the run | Field Agent (via mobile app)   |
| `COMPLETED`   | Run finished successfully                    | Field Agent (via mobile app)   |
| `CANCELLED`   | Run cancelled at any pre-completion stage    | Dispatcher, Supervisor, Admin  |

**Override rule:** A Supervisor or Admin can force a status transition outside the normal flow. Every override is logged in the audit trail with actor, timestamp, reason, and previous/new status.

---

## 6. Success Metrics

| Metric                    | Target (v1)                                          | Measurement Method                               |
|---------------------------|------------------------------------------------------|--------------------------------------------------|
| Run assignment time       | < 2 minutes from PENDING to ASSIGNED                 | Audit log timestamps                             |
| Dashboard load time       | < 2 seconds (p95)                                    | Frontend performance monitoring                  |
| Audit trail completeness  | 100% of state-changing actions logged                | Automated audit coverage test                    |
| Role enforcement accuracy | 0 unauthorized actions succeed                       | Security penetration test + automated RBAC tests |
| Accessibility compliance  | WCAG 2.1 AA                                          | Automated + manual audit                         |
| Test coverage             | ≥ 80% unit + integration                             | CI coverage report                               |
| User error rate           | < 5% of form submissions result in validation errors | Error tracking                                   |

---

## 7. Constraints

| Constraint            | Detail                                                                               |
|-----------------------|--------------------------------------------------------------------------------------|
| **Authentication**    | Externally managed (SSO/OAuth2). The panel consumes a token; it does not own auth.   |
| **Security boundary** | Frontend permission gates are UX-only. The API enforces all permissions server-side. |
| **Browser support**   | Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+ (per Next.js 16 requirements)     |
| **Accessibility**     | WCAG 2.1 AA is mandatory, not optional                                               |
| **Data residency**    | All data remains within the government network boundary                              |
| **Audit logs**        | Server-side only. The frontend displays but does not store audit records.            |

---

## 8. Assumptions

| #  | Assumption                                                              |
|----|-------------------------------------------------------------------------|
| A1 | Backend API is REST/JSON over HTTPS                                     |
| A2 | A single backend service handles all admin panel operations             |
| A3 | The permission model is role-based (not attribute-based) in v1          |
| A4 | Department hierarchy is flat in v1 (no nested sub-departments)          |
| A5 | Real-time updates (if required) will use polling or SSE — WebSocket TBD |

---

## 9. Open Questions

| #   | Question                                          | Owner            | Target Resolution          |
|-----|---------------------------------------------------|------------------|----------------------------|
| OQ1 | Is real-time run status update required in v1?    | Product Lead     | Before architecture lock   |
| OQ2 | Does the Analyst role ship in v1 or v2?           | Product Lead     | Sprint planning            |
| OQ3 | What is the exact SSO provider and token format?  | Platform Team    | Before auth implementation |
| OQ4 | Are departments hierarchical (nested) or flat?    | Product Lead     | Domain model review        |
| OQ5 | What is the data retention policy for audit logs? | Legal/Compliance | Before security sign-off   |

---

## Review Checklist

- [ ] Problem statement accurately reflects the operational pain points
- [ ] Scope table is agreed upon by Product and Engineering leads
- [ ] All five actor roles are correctly described
- [ ] Run lifecycle states match the canonical model in `src/models/run.ts`
- [ ] Success metrics have measurable targets and measurement methods
- [ ] All open questions have assigned owners
- [ ] Non-goals are explicit and agreed upon
