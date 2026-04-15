# Git Workflow — GOVMOBI-ADMIN

> **Status:** Authoritative — Mandatory for all contributors
> **Owner:** Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`commit-rules.md`](./commit-rules.md) · [`devops.md`](./devops.md) · [`engineering-standards.md`](./engineering-standards.md)

---

## 1. Branching Model

GOVMOBI-ADMIN uses a **trunk-based development** model with short-lived feature branches.

```
main (trunk)
  │
  ├── feature/runs-assignment-flow
  ├── feature/user-role-management
  ├── fix/run-status-pill-color
  ├── hotfix/session-expiry-redirect
  └── chore/update-dependencies
```

### Branch Rules

| Branch                  | Purpose                    | Lifetime  | Merge Target        |
|-------------------------|----------------------------|-----------|---------------------|
| `main`                  | Production-ready trunk     | Permanent | —                   |
| `feature/{description}` | New feature or enhancement | < 3 days  | `main`              |
| `fix/{description}`     | Bug fix                    | < 1 day   | `main`              |
| `hotfix/{description}`  | Production emergency fix   | Hours     | `main` + production |
| `chore/{description}`   | Maintenance, deps, config  | < 1 day   | `main`              |
| `docs/{description}`    | Documentation only         | < 1 day   | `main`              |

### Branch Naming Rules

```bash
# ✅ Correct
feature/run-assignment-flow
feature/supervisor-override-dialog
fix/status-pill-missing-cancelled-class
hotfix/session-cookie-not-cleared-on-logout
chore/upgrade-tanstack-query-v5
docs/update-api-contract-error-model

# ❌ Forbidden
my-feature
FEATURE-123
feature/fix-stuff
wip
```

---

## 2. Pull Request Rules

### PR Requirements (All Mandatory)

- [ ] Branch is up to date with `main` before requesting review
- [ ] CI pipeline is fully green (type check, lint, tests, build)
- [ ] PR title follows Conventional Commits format (see [`commit-rules.md`](./commit-rules.md))
- [ ] PR description uses the template below
- [ ] All new components have `data-testid`, JSDoc, and i18n
- [ ] Affected documentation is updated or explicitly noted as unchanged
- [ ] No merge commits in the branch history (rebase only)

### PR Size Guidelines

| Size   | Lines Changed | Guidance                                          |
|--------|---------------|---------------------------------------------------|
| Small  | < 200 lines   | Preferred — fast review                           |
| Medium | 200–500 lines | Acceptable — split if possible                    |
| Large  | > 500 lines   | Must be justified; consider splitting             |
| XL     | > 1000 lines  | Requires Engineering Lead approval to merge as-is |

### PR Description Template

```markdown
## Summary
<!-- One paragraph: what does this PR do and why? -->

## Changes
<!-- Bullet list of significant changes -->
- 
- 

## Related Use Cases
<!-- Link to relevant use cases from docs/product/use-cases.md -->
- UC-XXX: [Title]

## Testing
<!-- How was this tested? -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manually tested in local environment
- [ ] E2E tests added/updated (if applicable)

## Screenshots
<!-- For UI changes: before/after screenshots -->

## Checklist
- [ ] TypeScript compiles with zero errors
- [ ] All tests pass
- [ ] No hardcoded strings, colors, or role checks
- [ ] Data flow follows UI → Hook → Facade → API
- [ ] Affected docs updated
- [ ] Commit messages follow commit-rules.md
```

---

## 3. Review Process

### Reviewer Assignment

- **Minimum 1 reviewer** for all PRs.
- **Minimum 2 reviewers** for: security-sensitive changes, permission matrix changes, API contract changes, ADR additions.
- The PR author assigns reviewers — do not wait to be assigned.

### Review SLA

| PR Size | Expected Review Time |
|---------|----------------------|
| Small   | 4 business hours     |
| Medium  | 1 business day       |
| Large   | 2 business days      |

### Reviewer Checklist

```markdown
## Code Review Checklist

### Architecture
- [ ] Data flow follows UI → Hook → Facade → API
- [ ] No direct fetch in components
- [ ] No MSW imports outside src/msw/ and src/test/

### TypeScript
- [ ] No `any` without justification comment
- [ ] No `as` assertions without justification comment
- [ ] All exported elements have explicit types

### Components
- [ ] `data-testid` present on all new components
- [ ] JSDoc present on all exported elements
- [ ] i18n used for all user-visible strings
- [ ] Design tokens used (no hardcoded colors)
- [ ] Loading, error, and empty states handled

### Permissions
- [ ] `<Can />` or `usePermissions()` used for role gating
- [ ] No hardcoded role checks in components

### Tests
- [ ] Tests cover happy path, error state, and permission denial
- [ ] Tests use `data-testid` for element selection
- [ ] No implementation details tested (test behavior)

### Documentation
- [ ] Affected docs updated or explicitly noted as unchanged
```

---

## 4. Merge Strategy

- **Squash and merge** for feature and fix branches (clean history on `main`).
- **Merge commit** for hotfixes (preserve the hotfix branch history for traceability).
- **Rebase and merge** is forbidden (creates confusing history).

### Squash Commit Message

The squash commit message must follow Conventional Commits format:

```
feat(runs): implement supervisor override dialog with audit logging

- Add OverrideDialog component with mandatory reason field
- Add run.overridden audit event trigger
- Add useRunOverride mutation hook
- Add MSW handler for POST /api/runs/:id/override
- Add unit tests for OverrideDialog
- Add E2E test for supervisor override flow

Closes #42
```

---

## 5. Protected Branch Rules

`main` branch protection (enforced in repository settings):

- [ ] Require PR before merging (no direct pushes)
- [ ] Require CI to pass before merging
- [ ] Require at least 1 approved review
- [ ] Dismiss stale reviews when new commits are pushed
- [ ] Require branches to be up to date before merging
- [ ] Do not allow force pushes
- [ ] Do not allow branch deletion

---

## 6. Keeping Branches Up to Date

```bash
# Rebase your branch on main before requesting review
git fetch origin
git rebase origin/main

# If conflicts arise, resolve them and continue
git rebase --continue

# Force push after rebase (only on your own branch — never on main)
git push --force-with-lease origin feature/my-feature
```

---

## Review Checklist

- [ ] Branching model is clearly defined with lifetime expectations
- [ ] Branch naming rules have correct and incorrect examples
- [ ] PR template covers all mandatory sections
- [ ] Reviewer checklist is actionable and complete
- [ ] Merge strategy is explicit (squash and merge)
- [ ] Protected branch rules are listed for repository configuration
