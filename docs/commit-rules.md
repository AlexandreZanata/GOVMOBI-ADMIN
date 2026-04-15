# Commit Rules — GOVMOBI-ADMIN

> **Status:** Authoritative — Mandatory for all contributors
> **Owner:** Engineering Lead
> **Last reviewed:** See git log
> **Cross-links:** [`git-workflow.md`](./git-workflow.md)

---

## 1. Format

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Rules

- **type** — mandatory, lowercase, from the allowed list below
- **scope** — mandatory for this project, lowercase, from the allowed list below
- **short description** — mandatory; imperative mood; no period at end; max 72 characters
- **body** — optional; explains *what* and *why*, not *how*; wrap at 72 characters
- **footer** — optional; used for breaking changes and issue references

---

## 2. Allowed Types

| Type       | When to Use                                        |
|------------|----------------------------------------------------|
| `feat`     | A new feature or capability                        |
| `fix`      | A bug fix                                          |
| `docs`     | Documentation changes only                         |
| `style`    | Formatting, whitespace — no logic change           |
| `refactor` | Code restructuring — no feature change, no bug fix |
| `test`     | Adding or updating tests                           |
| `chore`    | Build process, dependency updates, config changes  |
| `perf`     | Performance improvement                            |
| `ci`       | CI/CD pipeline changes                             |
| `revert`   | Reverting a previous commit                        |

---

## 3. Allowed Scopes

| Scope           | Covers                                          |
|-----------------|-------------------------------------------------|
| `runs`          | Run management features and components          |
| `users`         | User management features and components         |
| `departments`   | Department management                           |
| `audit`         | Audit trail features                            |
| `reports`       | Reporting and analytics                         |
| `auth`          | Authentication and session management           |
| `dashboard`     | Dashboard and overview features                 |
| `permissions`   | Permission system (`<Can />`, `usePermissions`) |
| `design-system` | Design tokens, theme, atoms                     |
| `atoms`         | Atom components specifically                    |
| `molecules`     | Molecule components                             |
| `organisms`     | Organism components                             |
| `facades`       | Facade layer changes                            |
| `hooks`         | Custom hook changes                             |
| `stores`        | Zustand store changes                           |
| `msw`           | MSW mock handler changes                        |
| `i18n`          | Internationalization, locale files              |
| `config`        | Project configuration files                     |
| `deps`          | Dependency updates                              |
| `ci`            | CI/CD configuration                             |
| `docs`          | Documentation files                             |

---

## 4. Examples

### Feature commits

```bash
feat(runs): implement supervisor override dialog with audit logging
feat(users): add role change confirmation dialog
feat(dashboard): add real-time run status counters
feat(atoms): add StatusPill component with RunStatus support
feat(permissions): implement Can component and usePermissions hook
```

### Fix commits

```bash
fix(runs): correct status-pill color for CANCELLED status
fix(auth): clear session cookie on logout
fix(users): prevent admin from deactivating their own account
fix(atoms): Button spinner not centered in lg size variant
```

### Test commits

```bash
test(runs): add integration tests for useRunList hook with MSW
test(atoms): add StatusPill tests for all RunStatus values
test(permissions): add E2E test for dispatcher override denial
```

### Chore / docs commits

```bash
chore(deps): upgrade @tanstack/react-query to 5.99.0
chore(config): add bundle size budget to CI pipeline
docs(runs): update use-cases with UC-005 override edge cases
ci: add npm audit step to pipeline
```

### Breaking change

```bash
feat(api-contract)!: change run list response to paginated format

BREAKING CHANGE: GET /api/runs now returns { items: Run[], total: number, page: number }
instead of Run[]. Update all consumers of useRunList hook.
```

---

## 5. Forbidden Patterns

```bash
# ❌ No type
update button component

# ❌ No scope
feat: add override dialog

# ❌ Past tense
feat(runs): added override dialog

# ❌ Period at end
feat(runs): add override dialog.

# ❌ Vague description
fix(runs): fix bug

# ❌ Too long (> 72 chars)
feat(runs): implement the supervisor run status override dialog component with reason field

# ❌ Wrong type for a bug fix
chore(runs): fix status pill not showing correct color
```

---

## 6. Commit Message Linting

Commit messages are linted automatically via `commitlint` in the CI pipeline. A commit that does not conform to this format will fail the CI check and cannot be merged.

```bash
# Local validation (run before pushing)
npx commitlint --from HEAD~1 --to HEAD --verbose
```

---

## Review Checklist

- [ ] All allowed types are listed and described
- [ ] All allowed scopes cover every module in the project
- [ ] Examples cover feat, fix, test, chore, docs, and breaking change
- [ ] Forbidden patterns have concrete examples
- [ ] Linting enforcement is documented
