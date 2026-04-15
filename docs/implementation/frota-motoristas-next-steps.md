# Frota Motoristas — Next Steps and Prompt Pack

> **Audience:** Engineers using AI coding assistants
> **Scope:** Implement `/frota/motoristas` end-to-end in GOVMOBI-ADMIN
> **Cross-links:** [`./routes/route-frota-motoristas.md`](./routes/route-frota-motoristas.md) · [`./routes/route-servidores.md`](./routes/route-servidores.md) · [`./ai-driver-dispatcher-prompt-guide.md`](./ai-driver-dispatcher-prompt-guide.md)

---

## Objective

Deliver the motorista domain with production-ready architecture:

- UI -> Hook -> Facade -> API
- API envelope unwrap (`{ success, data, timestamp }` -> return `.data`)
- Permission-gated actions
- Full UX states (loading, error, empty)
- MSW coverage for happy and error paths

---

## Delivery Plan (Suggested)

1. **Contracts first**: model + types + facade + query keys
2. **Data flow**: query hook + mutation hooks
3. **Mocks/tests**: fixture + MSW handlers + hook tests
4. **UI**: page + organism + dialogs
5. **Integration**: permissions + nav + i18n registration
6. **Hardening**: validate UUID/CNH before API call and verify status enum in Swagger

---

## Prompt 1 — Domain Contract (Model + Types)

```text
You are implementing the motorista domain contract for GOVMOBI-ADMIN.

MANDATORY RULES:
- File: src/models/Motorista.ts
- File: src/types/motoristas.ts
- Export from src/models/index.ts
- Strict TypeScript, zero any

BUILD:
1) Motorista model with fields:
   id, servidorId, cnhNumero, cnhCategoria, statusOperacional,
   ativo, createdAt, updatedAt, deletedAt

2) Types:
- CreateMotoristaInput: { servidorId: string; cnhNumero: string; cnhCategoria: CnhCategoria }
- UpdateMotoristaInput: { cnhNumero?: string; cnhCategoria?: CnhCategoria }
- UpdateMotoristaStatusInput: { statusOperacional: MotoristaStatusOperacional }
- GetMotoristaByIdInput: { id: string }

3) Add category/status unions with TODO comments to sync final enum values from Swagger.
```

---

## Prompt 2 — Facade + Query Keys

```text
You are implementing the motoristasFacade and query key factory for GOVMOBI-ADMIN.

MANDATORY RULES:
- Files:
  - src/facades/motoristasFacade.ts
  - src/lib/queryKeys/motoristasKeys.ts
- Base URL: process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000"
- Use handleApiResponse<T>() and unwrap envelope.data
- JSDoc on all public methods
- Strict TypeScript, zero any

METHODS:
- listMotoristas()                      -> GET    /frota/motoristas
- getMotoristaById({ id })              -> GET    /frota/motoristas/:id
- createMotorista(input)                -> POST   /frota/motoristas
- updateMotorista(id, input)            -> PUT    /frota/motoristas/:id
- updateMotoristaStatus(id, input)      -> PATCH  /frota/motoristas/:id/status
- desativarMotorista(id)                -> PATCH  /frota/motoristas/:id/desativar
- reativarMotorista(id)                 -> PATCH  /frota/motoristas/:id/reativar

QUERY KEYS:
- list:   ["motoristas", "list"]
- detail: ["motoristas", "detail", id]

ERROR NOTES:
- 404 for not found
- 409 for duplicate CNH
- 400 for validation issues
- keep fallback handling for occasional 500 invalid UUID backend behavior
```

---

## Prompt 3 — Hooks (Query + Mutations)

```text
You are implementing query and mutation hooks for the motorista domain in GOVMOBI-ADMIN.

MANDATORY RULES:
- Files:
  - src/hooks/useMotoristas.ts
  - src/hooks/useCreateMotorista.ts
  - src/hooks/useUpdateMotorista.ts
  - src/hooks/useUpdateMotoristaStatus.ts
  - src/hooks/useDesativarMotorista.ts
  - src/hooks/useReativarMotorista.ts
- useQuery/useMutation from TanStack Query
- Hooks call motoristasFacade only (never fetch directly)
- On success: invalidate motoristasKeys.list()
- useUpdateMotorista must also invalidate motoristasKeys.detail(id)
- Toast messages from i18n (namespace: motoristas)
- Strict TypeScript, zero any

RETURN SHAPE:
- Query hook returns: { data, isLoading, isError, refetch }

ERROR TOAST RULES:
- 409 -> motoristas:toast.duplicateCnh
- 404 -> motoristas:toast.notFound
- 400 -> motoristas:toast.invalidData
- default -> common:toast.serverError
```

---

## Prompt 4 — MSW + Fixtures + Tests

```text
You are creating mock and test coverage for /frota/motoristas in GOVMOBI-ADMIN.

MANDATORY RULES:
- Files:
  - src/test/fixtures/motoristas.ts
  - src/msw/motoristasHandlers.ts
  - src/hooks/__tests__/useMotoristas.test.ts
  - src/hooks/__tests__/useCreateMotorista.test.ts
- Use msw v2 (http, HttpResponse, delay)
- Envelope shape: { success, data, timestamp }
- Base URL matches facade
- Include happy paths and errors (404, 409, 500)

HANDLERS REQUIRED:
- GET    /frota/motoristas
- POST   /frota/motoristas
- GET    /frota/motoristas/:id
- PUT    /frota/motoristas/:id
- PATCH  /frota/motoristas/:id/status
- PATCH  /frota/motoristas/:id/desativar
- PATCH  /frota/motoristas/:id/reativar

TESTS REQUIRED:
- loading, success, error states for query hook
- mutation success invalidates list
- mutation 409 and 404 error branches
```

---

## Prompt 5 — Page + Dialogs + Permissions

```text
You are implementing the /frota/motoristas page for GOVMOBI-ADMIN.

MANDATORY RULES:
- Route file: src/app/(admin)/frota/motoristas/page.tsx (Server Component)
- Client organism: src/components/organisms/MotoristasPageClient.tsx
- Dialogs:
  - src/components/molecules/MotoristaFormDialog.tsx
  - src/components/molecules/MotoristaStatusDialog.tsx
  - src/components/molecules/MotoristaDesativarDialog.tsx
- All strings via useTranslation("motoristas")
- Handle loading, error (retry), and empty states
- Permission gates via <Can perform="...">
- No hardcoded colors; design tokens only

ACTIONS:
- Create motorista
- Edit CNH data
- Update operational status
- Desativar / Reativar

ALSO UPDATE:
- src/models/Permission.ts with:
  MOTORISTA_VIEW, MOTORISTA_CREATE, MOTORISTA_EDIT,
  MOTORISTA_STATUS, MOTORISTA_DESATIVAR, MOTORISTA_REATIVAR
- src/config/nav.ts add /frota/motoristas item
- src/i18n/locales/en/nav.json add nav.motoristas
- src/i18n/locales/en/motoristas.json create full namespace
- src/i18n/config.ts register motoristas namespace
```

---

## Prompt 6 — Integration Review

```text
Review the /frota/motoristas implementation for GOVMOBI-ADMIN.
Focus on regressions, behavior bugs, and missing tests.

CHECKLIST:
- facade unwraps envelope.data for all endpoints
- no fetch calls in components/hooks outside facade
- query invalidation includes list and detail where needed
- PATCH /desativar used instead of DELETE
- status enum options match backend contract
- servidorId validated as UUID before submit
- form and toasts handle 400/404/409 and fallback 500
- MSW handlers cover all endpoints + error paths
- loading/error/empty states exist and are test-covered
- permissions and nav keys are fully wired
```

---

## Acceptance Checklist

- [ ] `route-frota-motoristas.md` is aligned with actual Swagger responses
- [ ] Facade methods unwrap `.data` consistently
- [ ] UI has create/edit/status/desativar/reativar flows
- [ ] Permissions are enforced via `<Can>` (no role string checks)
- [ ] `motoristas` i18n namespace exists and is registered
- [ ] Hook tests and MSW handlers cover core errors
- [ ] Sidebar contains `/frota/motoristas` with permission gate
- [ ] UUID validation prevents known invalid input crash case

