# Implementation Plan: Cargos UI Enhancement

## Overview

Standardize the Cargos page to match the Lotações/Motoristas pattern: icon buttons, search input, updated toolbar and table container styling, a new `CargoViewModal`, and migration of both dialogs to the shared `Modal` base component. All changes are purely presentational — no API or hook changes required.

Reference implementation: `LotacoesPageClient` + `LotacaoViewModal` + `LotacaoFormDialog` + `LotacaoDeleteDialog`.

## Tasks

- [x] 1. Add "view" i18n key to both locale files
  - Add `"view": "Visualizar"` under `"actions"` in `src/i18n/locales/pt-BR/cargos.json`
  - Add `"view": "View"` under `"actions"` in `src/i18n/locales/en/cargos.json`
  - _Requirements: 8.1, 8.2_

- [x] 2. Create CargoViewModal component
  - [x] 2.1 Implement `src/components/molecules/CargoViewModal.tsx`
    - Accept props: `open`, `onClose`, `cargo: Cargo | undefined`, `data-testid?`
    - Return `null` when `cargo` is `undefined`
    - Use `<Modal maxWidth="max-w-4xl" title={cargo.nome} ...>`
    - Status badge row: active/inactive ring badge + optional "Desativado em" badge when `deletedAt` is not null
    - "Dados Básicos" section: `nome` (`t("form.nome")`), `pesoPrioridade` (`t("form.pesoPrioridade")`)
    - "Identificação do registro" section: `id` (label: "ID")
    - "Auditoria" section: `createdAt` ("Criado em"), `updatedAt` ("Atualizado em"), `deletedAt` ("Excluído em") — display "—" when null
    - Use `safeFormatDate` helper (mirrors `LotacaoViewModal`) for all date fields
    - Mirror `Section` and `Field` sub-components from `LotacaoViewModal`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [ ]* 2.2 Write unit tests for CargoViewModal
    - File: `src/components/molecules/__tests__/CargoViewModal.test.tsx`
    - Follow the pattern of `LotacaoViewModal.test.tsx`
    - Test: returns `null` when `cargo` is `undefined`
    - Test: renders `cargo.nome` as modal title
    - Test: shows "Active"/"Inactive" status badge based on `ativo`
    - Test: displays all required sections ("Dados Básicos", "Identificação do registro", "Auditoria")
    - Test: displays `pesoPrioridade` value in "Dados Básicos"
    - Test: displays `id` in "Identificação do registro"
    - Test: displays "—" for `deletedAt` when null
    - Test: displays "Desativado em" badge when `deletedAt` is not null
    - _Requirements: 2.3, 2.4, 2.6, 2.11_

  - [ ]* 2.3 Write property test for CargoViewModal title (Property 3)
    - **Property 3: CargoViewModal title matches cargo nome**
    - For any `Cargo` record, when rendered with `open=true`, the modal title must equal `cargo.nome`
    - Use `fc.assert` with `arbitraryCargo()` generator, minimum 100 runs
    - **Validates: Requirements 2.4**

- [x] 3. Checkpoint — Ensure CargoViewModal tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Migrate CargoFormDialog to Modal base component
  - [x] 4.1 Refactor `src/components/molecules/CargoFormDialog.tsx`
    - Replace the hand-rolled `div` overlay + `section[role="dialog"]` with `<Modal maxWidth="max-w-4xl" title={t(titleKey)} ...>`
    - Move Cancel and Submit buttons to the `footer` prop
    - Wrap the two `Input` fields in a `<form>` with `className="grid gap-4 sm:grid-cols-2"` inside the Modal body
    - Remove the manual `useId`, `useEffect` for Escape key, and `useEffect` for focus-return (all delegated to `Modal`)
    - Preserve all existing validation logic, mutation calls, and `data-testid` attributes
    - `open=false` now returns `null` via `Modal` — remove the explicit early return
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 5. Migrate CargoDeleteDialog to Modal base component
  - [x] 5.1 Refactor `src/components/molecules/CargoDeleteDialog.tsx`
    - Replace the hand-rolled overlay + `section[role="dialog"]` with `<Modal title={t("actions.delete")} ...>` (default `max-w-lg`)
    - Move Cancel and Confirm buttons to the `footer` prop
    - Render the confirmation message and reversibility note as `children`
    - Remove the manual `useId` (delegated to `Modal`)
    - Preserve mutation logic, `data-testid` attributes, and `autoFocus` on the Confirm button
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 6. Update CargosPageClient
  - [x] 6.1 Add state and filtering logic
    - Add `search: string` state (initial `""`)
    - Add `viewTarget: Cargo | undefined` state (initial `undefined`)
    - Add `byStatus` memo: `filterByAtivo(data ?? [], filter)`
    - Add `filtered` memo: case-insensitive substring filter on `nome` against `search.trim()`, dependent on `byStatus`
    - Replace the existing single `filtered` memo with these two memos
    - _Requirements: 3.2, 3.3, 3.5, 3.6_

  - [x] 6.2 Restructure toolbar layout
    - Replace the existing filter-only `div` with a toolbar `div` matching `LotacoesPageClient`:
      `className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"`
    - Add search `<input type="search">` on the left with `flex-1`, `data-testid="cargos-search"`, `aria-label="Buscar cargos"`, `placeholder="Buscar por nome..."`, and a `<Search>` icon from `lucide-react`
    - Add vertical divider `<div className="hidden h-6 w-px bg-neutral-200 sm:block" aria-hidden="true" />`
    - Move filter pills to the right side; preserve `data-testid`, `aria-pressed`, and styling
    - _Requirements: 3.1, 3.7, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 6.3 Update table container and CargoRow to use icon buttons
    - Update table container `<div>` to `className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"` with `data-testid="cargos-table"`
    - Update `CargoRowProps` to add `onView: (cargo: Cargo) => void`
    - Replace `<Button>` text buttons in `CargoRow` with icon `<button>` elements (inline SVG), matching `LotacaoRow` pattern:
      - View (Eye SVG) — no permission gate, `data-testid={cargo-view-${cargo.id}}`, `aria-label={t("actions.view")}`, `title={t("actions.view")}`
      - Edit (Pencil SVG) — wrapped in `<Can perform={Permission.CARGO_EDIT}>`
      - Desativar (Circle-slash SVG) — wrapped in `<Can perform={Permission.CARGO_DELETE}>`, shown when `cargo.ativo === true`
      - Reativar (Rotate-cw SVG) — wrapped in `<Can perform={Permission.CARGO_REATIVAR}>`, shown when `cargo.ativo === false`, `disabled` when `reativarMutation.isPending`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 5.1, 5.2, 8.3_

  - [x] 6.4 Wire CargoViewModal into CargosPageClient
    - Import `CargoViewModal`
    - Pass `onView={setViewTarget}` to each `CargoRow`
    - Add `<CargoViewModal data-testid="cargo-view-modal" open={!!viewTarget} onClose={() => setViewTarget(undefined)} cargo={viewTarget} />` alongside the other dialogs
    - _Requirements: 2.1_

- [x] 7. Checkpoint — Ensure all dialog and page changes compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Write tests for CargosPageClient
  - [x] 8.1 Implement `src/components/organisms/__tests__/CargosPageClient.test.tsx`
    - Follow the pattern of `LotacoesPageClient.test.tsx`
    - Mock hooks: `useCargos`, `useCreateCargo`, `useUpdateCargo`, `useDeleteCargo`, `useReativarCargo`
    - Use `PermissionsProvider` with `UserRole` for permission-gated assertions
    - Test: renders table with cargo rows for ADMIN
    - Test: shows access denied for AGENT role
    - Test: renders loading skeleton when `isLoading` is true
    - Test: renders error state and calls `refetch` on retry
    - Test: renders empty state when filtered list is empty
    - Test: shows create button for ADMIN, hides for DISPATCHER
    - Test: opens form dialog when create button is clicked
    - Test: opens edit dialog when edit button is clicked
    - Test: opens delete dialog when delete button is clicked on active cargo
    - Test: shows reativar button for inactive cargo, not desativar
    - Test: filters to active only when active filter is clicked
    - Test: filters to inactive only when inactive filter is clicked
    - Test: renders search input with `data-testid="cargos-search"`, `aria-label="Buscar cargos"`, `placeholder="Buscar por nome..."`
    - Test: filters cargos by nome (case-insensitive)
    - Test: shows all cargos when search is cleared
    - Test: shows empty state when search returns no results
    - Test: combines search with status filter
    - Test: opens view modal when view button is clicked
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 3.7, 4.5, 5.1, 5.2_

  - [ ]* 8.2 Write property test for search filter (Property 1)
    - **Property 1: Search filter only returns matching rows**
    - For any array of cargos and any non-empty search term, every item in the filtered result must have a `nome` containing the term as a case-insensitive substring
    - Use `fc.assert` with `fc.array(arbitraryCargo())` and `fc.string({ minLength: 1 })`, minimum 100 runs
    - **Validates: Requirements 3.2**

  - [ ]* 8.3 Write property test for composed filters (Property 2)
    - **Property 2: Search and status filters compose correctly**
    - For any array of cargos, any `AtivoFilter` value, and any search term, every item in the doubly-filtered result must satisfy both the `ativo` condition and the `nome` substring condition simultaneously
    - Use `fc.assert` with `fc.array(arbitraryCargo())`, `fc.constantFrom("all", "active", "inactive")`, and `fc.string()`, minimum 100 runs
    - **Validates: Requirements 3.5**

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check`; an `arbitraryCargo()` generator must be defined in the test file
- The `LotacoesPageClient` and `LotacaoViewModal` implementations are the canonical reference for all patterns used here
