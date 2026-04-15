# Testing Strategy — GOVMOBI-ADMIN

> **Status:** Authoritative — Mandatory for all contributors
> **Owner:** Engineering Lead + QA Lead
> **Last reviewed:** See git log
> **Cross-links:** [`engineering-standards.md`](./engineering-standards.md) · [`product/use-cases.md`](./product/use-cases.md) · [`api-contract.md`](./api-contract.md) · [`devops.md`](./devops.md)

---

## 1. Testing Philosophy

- **Test behavior, not implementation.** Tests verify what the system does, not how it does it internally.
- **Tests are first-class code.** They follow the same standards as production code (TypeScript strict, no `any`, JSDoc on helpers).
- **MSW is the mock layer.** No `jest.mock()` of fetch or axios. All API mocking goes through MSW handlers.
- **Tests must be deterministic.** No flaky tests are merged. A flaky test is treated as a failing test.
- **Coverage is a floor, not a goal.** Meeting coverage minimums does not mean the tests are good.

---

## 2. Test Pyramid

```
         ┌─────────────────┐
         │   E2E Tests      │  ← Playwright — critical user journeys
         │   (few, slow)    │     ~10–20 scenarios
         └────────┬─────────┘
                  │
         ┌────────┴─────────┐
         │ Integration Tests │  ← Vitest + Testing Library + MSW
         │ (moderate)        │     Feature flows, hook + facade combos
         └────────┬──────────┘
                  │
         ┌────────┴──────────┐
         │   Unit Tests       │  ← Vitest + Testing Library
         │   (many, fast)     │     Atoms, utilities, models, facades
         └────────────────────┘
```

---

## 3. Tooling

| Tool                            | Purpose                               | Config File            |
|---------------------------------|---------------------------------------|------------------------|
| **Vitest**                      | Unit + integration test runner        | `vitest.config.mts`    |
| **@testing-library/react**      | Component rendering and interaction   | `src/test/setup.ts`    |
| **@testing-library/jest-dom**   | DOM assertion matchers                | `src/test/setup.ts`    |
| **@testing-library/user-event** | Realistic user interaction simulation | Per test               |
| **MSW**                         | API mocking for hooks and facades     | `src/msw/`             |
| **Playwright**                  | E2E browser automation                | `playwright.config.ts` |

### Test Setup File

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
// Global test setup — runs before every test file
```

### Render Helper (Mandatory for component tests)

```tsx
// src/test/renderWithProviders.tsx
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```

---

## 4. Coverage Minimums (Mandatory)

| Layer                                   | Minimum Coverage | Measured By     |
|-----------------------------------------|------------------|-----------------|
| Atoms (`src/components/atoms/`)         | 100% statements  | Vitest coverage |
| Molecules (`src/components/molecules/`) | 90% statements   | Vitest coverage |
| Hooks (`src/hooks/`)                    | 90% branches     | Vitest coverage |
| Facades (`src/facades/`)                | 95% statements   | Vitest coverage |
| Models / utilities                      | 100% statements  | Vitest coverage |
| Overall project                         | 80% statements   | Vitest coverage |

```bash
# Run tests with coverage
npm run test -- --coverage

# Coverage report location
coverage/index.html
```

---

## 5. Unit Test Standards

### What to Unit Test

- Every atom component: all variants, all states (loading, disabled, error)
- Every utility function: all branches
- Every model/enum: all values
- Every facade: success path + all error paths (4xx, 5xx, network error)

### Unit Test Template

```tsx
// src/components/atoms/__tests__/Button.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@/test/i18n-mock";
import { Button } from "../Button";

describe("Button", () => {
  // ── Rendering ──────────────────────────────────────────
  it("renders with correct label", () => {
    render(<Button data-testid="btn">Submit</Button>);
    expect(screen.getByTestId("btn")).toBeDefined();
    expect(screen.getByTestId("btn").textContent).toContain("Submit");
  });

  // ── Variants ───────────────────────────────────────────
  it.each(["primary", "secondary", "ghost", "destructive"] as const)(
    'renders variant "%s" without error',
    (variant) => {
      render(<Button variant={variant}>Label</Button>);
      expect(screen.getByRole("button")).toBeDefined();
    }
  );

  // ── States ─────────────────────────────────────────────
  it("is disabled and shows spinner when isLoading=true", () => {
    render(<Button data-testid="btn" isLoading>Save</Button>);
    const btn = screen.getByTestId("btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(btn.querySelector("svg")).toBeTruthy();
  });

  // ── Interaction ────────────────────────────────────────
  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  // ── Accessibility ──────────────────────────────────────
  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

## 6. Integration Test Standards

### What to Integration Test

- Hook + facade combinations with MSW handlers
- Feature flows: form submission → API call → UI update
- Permission gate behavior: correct rendering per role
- Error recovery flows: API error → error state → retry

### Integration Test Template

```typescript
// src/hooks/__tests__/useRunList.test.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { setupServer } from "msw/node";
import { runHandlers } from "@/msw/runHandlers";
import { renderWithProviders } from "@/test/renderWithProviders";
import { useRunList } from "../useRunList";

const server = setupServer(...runHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useRunList", () => {
  it("returns run list on success", async () => {
    const { result } = renderHook(() => useRunList({}), {
      wrapper: renderWithProviders,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items.length).toBeGreaterThan(0);
  });

  it("returns error state on API failure", async () => {
    server.use(
      http.get("/api/runs", () =>
        HttpResponse.json({ code: "SERVER_ERROR" }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useRunList({}), {
      wrapper: renderWithProviders,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

---

## 7. E2E Test Standards

### Critical Paths (Mandatory E2E Coverage)

| Scenario                                       | Priority |
|------------------------------------------------|----------|
| Login → Dashboard load                         | P0       |
| Dispatcher creates a run                       | P0       |
| Dispatcher assigns a run to an agent           | P0       |
| Supervisor overrides run status                | P0       |
| Admin creates a user                           | P1       |
| Admin changes user role                        | P1       |
| Admin deactivates a user                       | P1       |
| Audit trail displays override event            | P1       |
| Permission denial — Dispatcher cannot override | P1       |
| Session expiry → redirect to login             | P1       |

### E2E Test Template

```typescript
// e2e/runs/assign-run.spec.ts
import { test, expect } from "@playwright/test";
import { loginAs } from "../helpers/auth";

test.describe("Run Assignment", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "dispatcher");
  });

  test("dispatcher can assign a pending run to an agent", async ({ page }) => {
    await page.goto("/runs");

    // Find a PENDING run
    const pendingRun = page.getByTestId("run-row-pending").first();
    await pendingRun.click();

    // Assign agent
    await page.getByRole("button", { name: /assign agent/i }).click();
    await page.getByTestId("agent-select").selectOption("agent-001");
    await page.getByRole("button", { name: /confirm/i }).click();

    // Verify status changed
    await expect(page.getByTestId("run-status-pill")).toHaveText("Assigned");
  });

  test("dispatcher cannot override run status", async ({ page }) => {
    await page.goto("/runs");
    const run = page.getByTestId("run-row").first();
    await run.click();

    // Override button should not be visible
    await expect(
      page.getByRole("button", { name: /override status/i })
    ).not.toBeVisible();
  });
});
```

---

## 8. Risk-Based Test Prioritization

| Feature Domain        | Risk Level | Test Priority | Rationale                          |
|-----------------------|------------|---------------|------------------------------------|
| Run override          | Critical   | P0            | High-impact action; audit required |
| User role change      | Critical   | P0            | Security-sensitive; irreversible   |
| User deactivation     | Critical   | P0            | Affects active runs                |
| Run assignment        | High       | P1            | Core operational flow              |
| Permission gates      | High       | P1            | Security boundary                  |
| Run creation          | High       | P1            | Core operational flow              |
| Audit trail display   | High       | P1            | Compliance requirement             |
| Run cancellation      | Medium     | P2            | Common but recoverable             |
| Department management | Medium     | P2            | Infrequent; low risk               |
| Dashboard display     | Low        | P3            | Read-only; no state change         |
| Report viewing        | Low        | P3            | Read-only; no state change         |

---

## 9. Test File Organization

```
src/
  components/
    atoms/
      __tests__/
        atoms.test.tsx        ← All atom tests in one file (small components)
    molecules/
      __tests__/
        RunStatusFilter.test.tsx
    organisms/
      __tests__/
        RunTable.test.tsx
  hooks/
    __tests__/
      useRunList.test.ts
      useRunMutations.test.ts
  facades/
    __tests__/
      runFacade.test.ts

e2e/
  runs/
    assign-run.spec.ts
    override-run.spec.ts
  users/
    create-user.spec.ts
  auth/
    login.spec.ts
    session-expiry.spec.ts
  helpers/
    auth.ts
    fixtures.ts
```

---

## 10. Test Data and Fixtures

- **Mandatory:** Test data is defined in `src/test/fixtures/` — never hardcoded inline.
- **Mandatory:** MSW handlers use fixture data — consistent across unit and integration tests.
- **Forbidden:** Tests that depend on external services or real API endpoints.
- **Forbidden:** Tests that share mutable state between test cases.

```typescript
// src/test/fixtures/runs.ts
export const mockRun: Run = {
  id: "run-001",
  title: "Inspection Route A",
  status: RunStatus.PENDING,
  departmentId: "dept-001",
  createdAt: "2026-04-15T08:00:00Z",
  updatedAt: "2026-04-15T08:00:00Z",
};

export const mockRunList: Run[] = [
  mockRun,
  { ...mockRun, id: "run-002", status: RunStatus.ASSIGNED },
  { ...mockRun, id: "run-003", status: RunStatus.IN_PROGRESS },
];
```

---

## Review Checklist

- [ ] Test pyramid is defined with approximate counts per layer
- [ ] All tooling is listed with config file references
- [ ] Coverage minimums are defined per layer
- [ ] Unit, integration, and E2E templates are provided
- [ ] Critical E2E paths are listed with priority levels
- [ ] Risk-based prioritization table covers all feature domains
- [ ] Test file organization matches the source structure
- [ ] Test data fixture pattern is defined
