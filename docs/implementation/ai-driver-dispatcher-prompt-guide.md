# AI Implementation Prompt Guide — GOVMOBI-ADMIN

> **Audience:** Engineers using AI coding assistants (Kiro, Copilot, Claude, etc.)
> **Cross-links:** [`../design-system/design-system-ai-guidelines.md`](../design-system/design-system-ai-guidelines.md) · [`../engineering-standards.md`](../engineering-standards.md) · [`../architecture/system-design.md`](../architecture/system-design.md)

---

## How to Use This Guide

Each prompt template below is designed to produce code that is consistent with GOVMOBI-ADMIN's architecture, standards, and business rules. Copy the template, fill in the bracketed placeholders, and submit to your AI assistant.

**Before using any template, ensure the AI has read:**
1. `docs/design-system/design-system-ai-guidelines.md` — mandatory rules
2. `docs/engineering-standards.md` — code standards
3. `docs/architecture/system-design.md` — data flow

---

## Template 1: New Atom Component

```
You are implementing a UI component for GOVMOBI-ADMIN, an internal government operations admin panel.

MANDATORY RULES (non-negotiable):
- File: src/components/atoms/[ComponentName].tsx
- Add "use client" directive at the top
- Export a typed props interface as [ComponentName]Props
- Accept a data-testid prop
- Use useTranslation() for ALL user-visible strings — no hardcoded English
- Use design tokens only — no hardcoded colors, no inline styles
- Use Tailwind utility classes only
- Include JSDoc with @param and @returns on the exported function
- Export the component and its types from src/components/atoms/index.ts

STACK: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, react-i18next

TOKEN REFERENCE:
- Colors: bg-brand-primary, text-danger, bg-success/15, bg-neutral-200, etc.
- Radius: rounded-[var(--radius-md)], rounded-[var(--radius-full)]
- See: src/theme/govmobile.css and src/theme/tokens.ts

COMPONENT TO BUILD:
Name: [ComponentName]
Purpose: [describe what it does]
Props: [list props with types and defaults]
Variants: [list variants if applicable]
i18n keys needed: [namespace:key pairs]
Accessibility requirements: [aria attributes, keyboard behavior]

Also create a test file at src/components/atoms/__tests__/[ComponentName].test.tsx that:
- Mocks react-i18next using the pattern in src/test/i18n-mock.ts
- Tests all variants
- Tests all interactive states
- Tests accessibility attributes (aria-*)
- Uses data-testid for element selection
```

---

## Template 2: New Custom Hook (Query)

```
You are implementing a data-fetching hook for GOVMOBI-ADMIN.

MANDATORY RULES:
- File: src/hooks/use[HookName].ts
- Uses TanStack Query useQuery
- Calls [domain]Facade.[method]() — NEVER calls fetch directly
- Uses the [domain]Keys query key factory
- Returns { data, isLoading, isError, refetch } (TanStack Query shape)
- Full TypeScript — zero any
- JSDoc on the exported function

ARCHITECTURE (non-negotiable):
UI Component → this hook → [domain]Facade → fetch ← MSW

HOOK TO BUILD:
Name: use[HookName]
Domain: [runs | users | departments | audit]
Facade method: [domain]Facade.[methodName]
Query key: [domain]Keys.[keyName]([params])
Input params: [list params with types]
Return type: [ReturnType from src/types/ or src/models/]
Stale time: [milliseconds — default 30000]

Also create a test at src/hooks/__tests__/use[HookName].test.ts that:
- Uses setupServer from msw/node with the relevant handlers
- Tests: loading state, success state, error state (500), 403 forbidden
- Uses renderHook from @testing-library/react
- Uses renderWithProviders as the wrapper
```

---

## Template 3: New Custom Hook (Mutation)

```
You are implementing a mutation hook for GOVMOBI-ADMIN.

MANDATORY RULES:
- File: src/hooks/use[HookName].ts
- Uses TanStack Query useMutation
- Calls [domain]Facade.[method]() — NEVER calls fetch directly
- On success: invalidates relevant query keys + shows success toast
- On error: shows error toast with appropriate message per error code
- Full TypeScript — zero any
- JSDoc on the exported function

MUTATION TO BUILD:
Name: use[HookName]
Domain: [runs | users | departments]
Facade method: [domain]Facade.[methodName]
Input type: [InputType]
Return type: [ReturnType]
Query keys to invalidate on success: [list keys]
Audit event triggered: [event name from api-contract.md]
Permission required: [permission string e.g. "run:override"]

Error handling:
- 403 FORBIDDEN: [message key]
- 422 VALIDATION_ERROR: [message key]
- 500 SERVER_ERROR: [message key]

Also create a test that covers: success path, 403 error, 422 error, 500 error.
```

---

## Template 4: New Facade Method

```
You are adding a method to an existing facade in GOVMOBI-ADMIN.

MANDATORY RULES:
- File: src/facades/[domain]Facade.ts
- Method calls fetch to the specified endpoint
- Uses handleApiResponse<T>() for response parsing and error throwing
- Input and return types come from src/types/ or src/models/ — define new types if needed
- JSDoc with @param, @returns, @throws ApiError
- Zero any

FACADE METHOD TO BUILD:
Domain: [runs | users | departments | audit]
Method name: [methodName]
HTTP method: [GET | POST | PATCH | DELETE]
Endpoint: /v1/[path]
Input type: [InputType or null]
Return type: [ReturnType]
Error cases: [list expected error codes]

Also add a corresponding MSW handler to src/msw/[domain]Handlers.ts that:
- Simulates 200-500ms latency with delay()
- Returns realistic mock data matching the return type
- Includes an error scenario handler (use server.use() pattern in tests)
```

---

## Template 5: Feature Page (Run Domain)

```
You are implementing a feature page for GOVMOBI-ADMIN.

MANDATORY RULES:
- Follow the architecture: UI → Hook → Facade → API
- Server Components by default; "use client" only for interactive parts
- All strings via useTranslation()
- All colors via design tokens
- Handle: isLoading (skeleton), isError (ErrorState + retry), empty state
- Permission gates via <Can perform="..."> — never hardcode role checks
- data-testid on all interactive elements
- JSDoc on all exported components

STACK: Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4

PAGE TO BUILD:
Route: /[domain]/[path]
File: src/app/(admin)/[domain]/page.tsx
Purpose: [describe the page]
Data needed: [list queries]
Actions available: [list mutations with required permissions]
Roles that can access: [list roles]
Empty state: [describe empty state]
Filters: [list filterable fields]

Components to create:
- Page component (Server Component if possible)
- [List any new organisms/molecules needed]

Tests to create:
- Page renders correctly for each role
- Permission gates hide/show correct actions
- Empty state renders when no data
- Error state renders on API failure
```

---

## Template 6: Confirmation Dialog

```
You are implementing a confirmation dialog for a destructive action in GOVMOBI-ADMIN.

MANDATORY RULES:
- Uses the ConfirmDialog molecule (or creates it if it doesn't exist)
- Mandatory reason field for: run cancellation, run override, user deactivation
- Confirm button uses variant="destructive"
- Cancel button uses variant="ghost"
- Escape key closes without action
- Focus returns to trigger on close
- aria-modal="true", role="dialog", aria-labelledby

DIALOG TO BUILD:
Action: [describe the action]
Entity: [run | user | department]
Requires reason: [yes | no]
Reason field label: [i18n key]
Confirm button label: [i18n key]
Permission required: [permission string]
Audit event: [event name]
On confirm: calls [mutation hook]

Also write tests that verify:
- Dialog opens on trigger click
- Confirm button disabled when reason is empty (if required)
- Confirm button calls mutation on click
- Dialog closes on Escape
- Focus returns to trigger on close
```

---

## Template 7: MSW Handler Set

```
You are creating MSW handlers for a new domain in GOVMOBI-ADMIN.

MANDATORY RULES:
- File: src/msw/[domain]Handlers.ts
- Uses msw v2 http and HttpResponse
- Simulates realistic latency: delay(200) to delay(600)
- Covers all endpoints defined in docs/api-contract.md for this domain
- Uses fixture data from src/test/fixtures/[domain].ts
- Includes error scenario handlers (403, 404, 422, 500)
- Exported as [domain]Handlers array

DOMAIN: [runs | users | departments | audit]
ENDPOINTS TO MOCK: [list from api-contract.md]
FIXTURE FILE: src/test/fixtures/[domain].ts

For each endpoint include:
- Happy path handler (200/201)
- 403 Forbidden handler (for permission testing)
- 422 Validation error handler (for form testing)
- 500 Server error handler (for error state testing)
```

---

## Common Mistakes to Avoid

When reviewing AI-generated code for this project, check for these common errors:

| Mistake                            | Correct Approach                              |
|------------------------------------|-----------------------------------------------|
| `tailwind.config.ts` created       | Delete it — Tailwind v4 uses CSS-first config |
| `@tailwind base` in CSS            | Use `@import 'tailwindcss'`                   |
| `getServerSideProps` used          | Use async Server Components                   |
| `next/router` imported             | Use `next/navigation`                         |
| `vite-tsconfig-paths` plugin added | Use `resolve.tsconfigPaths: true`             |
| `any` type used                    | Define proper types                           |
| Hardcoded color in className       | Use token class (e.g. `bg-brand-primary`)     |
| `if (user.role === "ADMIN")`       | Use `<Can perform="...">`                     |
| `fetch()` in component             | Move to facade, call via hook                 |
| Missing loading/error/empty states | All three are mandatory                       |

---

## Review Checklist

- [ ] All 7 templates cover the main implementation scenarios
- [ ] Each template includes mandatory rules at the top
- [ ] Each template requests a corresponding test
- [ ] Common mistakes table covers Next.js 16 / Tailwind v4 specific pitfalls
- [ ] Templates reference the correct file paths and naming conventions
