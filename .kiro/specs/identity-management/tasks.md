# Implementation Plan: Identity Management

## Overview

This plan implements full CRUD lifecycle management for three interconnected domains — **Cargos**, **Lotações**, and **Servidores** — following the project's layered architecture (UI → Hook → Facade → API). Implementation order respects foreign key dependencies: Cargos → Lotações → Servidores.

Many files already exist (models, types, facades, hooks, MSW handlers, fixtures, page clients, i18n). The tasks focus on filling gaps: missing permissions, missing UI components (CargoFormDialog, CargoDeleteDialog), extracting `formatCpf` to a shared utility, wiring action buttons into existing page clients, reviewing/updating existing dialogs and organisms, and adding comprehensive tests including property-based tests with fast-check.

## Tasks

- [x] 1. Add missing permissions and install fast-check
  - [x] 1.1 Add missing permission enum values to `src/models/Permission.ts`
    - Add `CARGO_CREATE = "cargo:create"`, `CARGO_EDIT = "cargo:edit"`, `CARGO_DELETE = "cargo:delete"`, `CARGO_REATIVAR = "cargo:reativar"`, and `LOTACAO_REATIVAR = "lotacao:reativar"` to the `Permission` enum
    - Verify `RolePermissionMap[UserRole.ADMIN]` uses `Object.values(Permission)` so new entries are automatically included
    - _Requirements: 18.2_

  - [x] 1.2 Install `fast-check` as a dev dependency
    - Run `npm install --save-dev fast-check` with exact version pinning
    - _Requirements: Design — Testing Strategy_

- [x] 2. Extract `formatCpf` utility and create `filterByAtivo` helper
  - [x] 2.1 Create `src/lib/formatCpf.ts` utility
    - Extract `formatCpf` from `src/components/molecules/ServidorFormDialog.tsx` into `src/lib/formatCpf.ts`
    - Update imports in `ServidorFormDialog.tsx` and `ServidoresPageClient.tsx` to use the new shared location
    - Include JSDoc documentation
    - _Requirements: 11.2_

  - [x] 2.2 Create `src/lib/filterByAtivo.ts` utility
    - Extract the active/inactive/all filtering logic used across all three page clients into a reusable typed function
    - Signature: `filterByAtivo<T extends { ativo: boolean }>(items: T[], filter: "all" | "active" | "inactive"): T[]`
    - Include JSDoc documentation
    - _Requirements: 1.5, 6.5, 11.6_

  - [ ]* 2.3 Write property test for `filterByAtivo` (Property 1)
    - **Property 1: Active/Inactive filter partitions entities correctly**
    - For any list of entities with mixed `ativo` values: "active" filter returns only `ativo === true`, "inactive" returns only `ativo === false`, "all" returns the original list, and the union of active + inactive equals the full list
    - Test file: `src/lib/__tests__/filterByAtivo.property.test.ts`
    - Use fast-check with minimum 100 iterations
    - **Validates: Requirements 1.5, 6.5, 11.6**

  - [ ]* 2.4 Write property test for `formatCpf` (Property 2)
    - **Property 2: CPF formatting preserves digits and produces correct pattern**
    - For any string of exactly 11 digits, `formatCpf` produces a string matching `XXX.XXX.XXX-XX`, and removing non-digit characters yields the original input
    - Test file: `src/lib/__tests__/formatCpf.property.test.ts`
    - Use fast-check with minimum 100 iterations
    - **Validates: Requirements 11.2**

- [x] 3. Checkpoint — Verify utilities and property tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement Cargos domain — missing UI components
  - [x] 4.1 Create `src/components/molecules/CargoFormDialog.tsx`
    - Create/edit dialog with fields: `nome` (text, required, max 100 chars), `pesoPrioridade` (number, required, min 0, max 100)
    - Props: `mode: "create" | "edit"`, `cargo?: Cargo`, `open: boolean`, `onClose: () => void`
    - Create mode calls `useCreateCargo`, edit mode calls `useUpdateCargo`
    - Close on success, stay open and show inline error on HTTP 409 (duplicate name)
    - Use `useTranslation("cargos")` for all strings
    - Include `data-testid` props and JSDoc
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 3.5_

  - [x] 4.2 Create `src/components/molecules/CargoDeleteDialog.tsx`
    - Confirmation dialog for soft-delete with reversibility message
    - Props: `cargoId: string`, `cargoNome: string`, `open: boolean`, `onClose: () => void`
    - Confirm button (variant="destructive") calls `useDeleteCargo`
    - Cancel button (variant="ghost")
    - Use `useTranslation("cargos")` for all strings
    - Include `data-testid` props and JSDoc
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 4.3 Update `src/components/organisms/CargosPageClient.tsx` with action buttons
    - Add "New Cargo" button gated by `<Can perform={Permission.CARGO_CREATE}>`
    - Add Actions column to table with Edit button (`<Can perform={Permission.CARGO_EDIT}>`), Deactivate button (`<Can perform={Permission.CARGO_DELETE}>`) for active rows, and Reactivate button (`<Can perform={Permission.CARGO_REATIVAR}>`) for inactive rows
    - Wire CargoFormDialog (create/edit modes) and CargoDeleteDialog
    - Wire `useReativarCargo` for reactivation
    - Replace inline filter logic with `filterByAtivo` utility
    - _Requirements: 1.1, 1.5, 2.2, 3.1, 4.1, 5.1, 5.2, 5.3_

  - [ ]* 4.4 Write unit tests for CargoFormDialog
    - Test create mode rendering, edit mode pre-population, form validation, 409 inline error handling, success close behavior
    - Test file: `src/components/molecules/__tests__/CargoFormDialog.test.tsx`
    - _Requirements: 2.1, 2.3, 2.5, 3.2, 3.3, 3.5_

  - [ ]* 4.5 Write unit tests for CargoDeleteDialog
    - Test dialog rendering, confirm deactivation, cancel behavior
    - Test file: `src/components/molecules/__tests__/CargoDeleteDialog.test.tsx`
    - _Requirements: 4.2, 4.3_

  - [ ]* 4.6 Write unit tests for CargosPageClient
    - Test loading state, error state with retry, empty state, table rendering, filter toggle (all/active/inactive), permission gates for all action buttons
    - Test file: `src/components/organisms/__tests__/CargosPageClient.test.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 3.1, 4.1, 5.1_

- [x] 5. Checkpoint — Verify Cargos domain
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Review and update Lotações domain
  - [x] 6.1 Review and update `src/components/molecules/LotacaoFormDialog.tsx`
    - Verify create/edit dialog has field: `nome` (text, required, max 100 chars)
    - Verify create mode calls `useCreateLotacao`, edit mode calls `useUpdateLotacao`
    - Verify dialog stays open on HTTP 409 with inline error
    - Ensure all strings use `useTranslation("lotacoes")`
    - Ensure `data-testid` props and JSDoc are present
    - _Requirements: 7.1, 7.3, 7.4, 7.5, 8.2, 8.3, 8.4, 8.5_

  - [x] 6.2 Review and update `src/components/molecules/LotacaoDeleteDialog.tsx`
    - Verify confirmation dialog with reversibility message
    - Verify confirm calls `useDeleteLotacao`, cancel closes dialog
    - Ensure all strings use `useTranslation("lotacoes")`
    - Ensure `data-testid` props and JSDoc are present
    - _Requirements: 9.2, 9.3, 9.4_

  - [x] 6.3 Update `src/components/organisms/LotacoesPageClient.tsx` with action buttons and permission gates
    - Verify/add "New Lotação" button gated by `<Can perform={Permission.LOTACAO_CREATE}>`
    - Verify/add Actions column with Edit (`LOTACAO_EDIT`), Deactivate (`LOTACAO_DELETE`) for active rows, Reactivate (`LOTACAO_REATIVAR`) for inactive rows
    - Wire LotacaoFormDialog (create/edit modes) and LotacaoDeleteDialog
    - Wire `useReativarLotacao` for reactivation
    - Replace inline filter logic with `filterByAtivo` utility
    - _Requirements: 6.1, 6.5, 7.2, 8.1, 9.1, 10.1, 10.2, 10.3_

  - [ ]* 6.4 Write unit tests for LotacaoFormDialog
    - Test create mode, edit mode pre-population, validation, 409 inline error, success close
    - Test file: `src/components/molecules/__tests__/LotacaoFormDialog.test.tsx`
    - _Requirements: 7.1, 7.3, 7.5, 8.2, 8.3, 8.5_

  - [ ]* 6.5 Write unit tests for LotacaoDeleteDialog
    - Test dialog rendering, confirm deactivation, cancel behavior
    - Test file: `src/components/molecules/__tests__/LotacaoDeleteDialog.test.tsx`
    - _Requirements: 9.2, 9.3_

  - [ ]* 6.6 Write unit tests for LotacoesPageClient
    - Test loading state, error state with retry, empty state, table rendering, filter toggle, permission gates
    - Test file: `src/components/organisms/__tests__/LotacoesPageClient.test.tsx`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.2, 8.1, 9.1, 10.1_

- [x] 7. Checkpoint — Verify Lotações domain
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Review and update Servidores domain
  - [x] 8.1 Review and update `src/components/molecules/ServidorFormDialog.tsx`
    - Verify create mode has all fields: nome, cpf (11 digits), email, telefone, cargoId (select from active cargos via `useCargos`), lotacaoId (select from active lotações via `useLotacoes`), papéis (multi-select: USUARIO, ADMIN, MOTORISTA)
    - Verify edit mode renders cpf and email as read-only/disabled
    - Verify edit mode allows editing nome, telefone, cargoId, lotacaoId, papéis
    - Verify create calls `useCreateServidor`, edit calls `useUpdateServidor`
    - Verify inline error handling for 400, 404, 409
    - Update `formatCpf` import to use `@/lib/formatCpf` (already done in task 2.1)
    - Ensure all strings use `useTranslation("servidores")`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.7, 12.8, 12.9, 13.2, 13.3, 13.4, 13.5, 13.7_

  - [x] 8.2 Create `src/lib/buildServidorUpdatePayload.ts` utility
    - Implement a function that compares original Servidor data with form values and returns only changed fields
    - Signature: `buildServidorUpdatePayload(original: Servidor, edited: UpdateServidorInput): Partial<UpdateServidorInput>`
    - Include JSDoc documentation
    - Wire into `ServidorFormDialog.tsx` for edit mode submissions
    - _Requirements: 13.5_

  - [x] 8.3 Review and update `src/components/molecules/ServidorDeleteDialog.tsx`
    - Verify confirmation dialog with reversibility message
    - Verify confirm calls `useDeleteServidor`, cancel closes dialog
    - Ensure all strings use `useTranslation("servidores")`
    - Ensure `data-testid` props and JSDoc are present
    - _Requirements: 14.2, 14.3, 14.4_

  - [x] 8.4 Update `src/components/organisms/ServidoresPageClient.tsx` with action buttons and permission gates
    - Verify/add "New Servidor" button gated by `<Can perform={Permission.SERVIDOR_CREATE}>`
    - Verify/add Actions column with Edit (`SERVIDOR_EDIT`), Deactivate (`SERVIDOR_DELETE`) for active rows, Reactivate (`SERVIDOR_REATIVAR`) for inactive rows
    - Verify CPF is displayed formatted as `XXX.XXX.XXX-XX` using `formatCpf` from `@/lib/formatCpf`
    - Verify papéis are rendered as Badge components
    - Wire ServidorFormDialog (create/edit modes) and ServidorDeleteDialog
    - Wire `useReativarServidor` for reactivation
    - Replace inline filter logic with `filterByAtivo` utility
    - _Requirements: 11.1, 11.2, 11.6, 12.2, 13.1, 14.1, 15.1, 15.2, 15.3_

  - [ ]* 8.5 Write property test for `buildServidorUpdatePayload` (Property 3)
    - **Property 3: Servidor update payload contains only changed fields**
    - For any existing Servidor and any set of edits to mutable fields, the payload contains only fields whose values differ from the original
    - Test file: `src/hooks/servidores/__tests__/buildUpdatePayload.property.test.ts`
    - Use fast-check with minimum 100 iterations
    - **Validates: Requirements 13.5**

  - [ ]* 8.6 Write unit tests for ServidorFormDialog
    - Test create mode with all fields, edit mode with cpf/email read-only, cargo/lotação selects show only active entries, papéis multi-select, 400/404/409 inline errors, success close
    - Test file: `src/components/molecules/__tests__/ServidorFormDialog.test.tsx`
    - _Requirements: 12.1, 12.3, 12.4, 12.7, 12.8, 12.9, 13.2, 13.3, 13.4, 13.5, 13.7_

  - [ ]* 8.7 Write unit tests for ServidorDeleteDialog
    - Test dialog rendering, confirm deactivation, cancel behavior
    - Test file: `src/components/molecules/__tests__/ServidorDeleteDialog.test.tsx`
    - _Requirements: 14.2, 14.3_

  - [ ]* 8.8 Write unit tests for ServidoresPageClient
    - Test loading state, error state with retry, empty state, table rendering with CPF formatting and papéis badges, filter toggle, permission gates
    - Test file: `src/components/organisms/__tests__/ServidoresPageClient.test.tsx`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 13.1, 14.1, 15.1_

- [x] 9. Checkpoint — Verify Servidores domain
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Facade and hook tests across all domains
  - [ ]* 10.1 Write property test for envelope unwrapping (Property 4)
    - **Property 4: Facade envelope unwrapping returns clean domain data**
    - For any valid domain object wrapped in `{ success: true, data: T, timestamp: string }`, the facade returns an object deeply equal to the unwrapped `data` field
    - Test file: `src/facades/__tests__/envelopeUnwrap.property.test.ts`
    - Use fast-check with minimum 100 iterations
    - **Validates: Requirements 16.1, 16.2, 16.3**

  - [ ]* 10.2 Write unit tests for `cargosFacade`
    - Test `listCargos` (200), `createCargo` (201, 409), `updateCargo` (200, 404, 409), `deleteCargo` (200, 404), `reativarCargo` (200, 404)
    - Test file: `src/facades/__tests__/cargosFacade.test.ts`
    - _Requirements: 1.1, 2.3, 3.3, 4.3, 5.2, 16.1_

  - [ ]* 10.3 Write unit tests for `lotacoesFacade`
    - Test `listLotacoes` (200), `createLotacao` (201, 409), `updateLotacao` (200, 404, 409), `deleteLotacao` (200, 404), `reativarLotacao` (200, 404)
    - Test file: `src/facades/__tests__/lotacoesFacade.test.ts`
    - _Requirements: 6.1, 7.3, 8.3, 9.3, 10.2, 16.2_

  - [ ]* 10.4 Write unit tests for `servidoresFacade`
    - Test `listServidores` (200), `createServidor` (201, 400, 404, 409), `updateServidor` (200, 404), `deleteServidor` (200, 404), `reativarServidor` (200, 404)
    - Test file: `src/facades/__tests__/servidoresFacade.test.ts`
    - _Requirements: 11.1, 12.5, 12.7, 12.8, 12.9, 13.5, 14.3, 15.2, 16.3_

  - [ ]* 10.5 Write unit tests for Cargos hooks
    - Test `useCargos` (success, error), `useCreateCargo` (invalidation, toast, 409), `useUpdateCargo` (invalidation of list + detail, toast), `useDeleteCargo` (invalidation, toast), `useReativarCargo` (invalidation, toast)
    - Test files: `src/hooks/cargos/__tests__/useCargos.test.ts`, `useCreateCargo.test.ts`, `useUpdateCargo.test.ts`, `useDeleteCargo.test.ts`, `useReativarCargo.test.ts`
    - _Requirements: 1.1, 2.3, 2.4, 3.3, 3.4, 4.3, 4.4, 5.2, 5.3, 20.2, 20.3_

  - [ ]* 10.6 Write unit tests for Lotações hooks
    - Test `useLotacoes` (success, error), `useCreateLotacao` (invalidation, toast, 409), `useUpdateLotacao` (invalidation of list + detail, toast), `useDeleteLotacao` (invalidation, toast), `useReativarLotacao` (invalidation, toast)
    - Test files: `src/hooks/lotacoes/__tests__/useLotacoes.test.ts`, `useCreateLotacao.test.ts`, `useUpdateLotacao.test.ts`, `useDeleteLotacao.test.ts`, `useReativarLotacao.test.ts`
    - _Requirements: 6.1, 7.3, 7.4, 8.3, 8.4, 9.3, 9.4, 10.2, 10.3, 20.2, 20.3_

  - [ ]* 10.7 Write unit tests for Servidores hooks
    - Test `useServidores` (success, error), `useCreateServidor` (invalidation, toast, 400/404/409), `useUpdateServidor` (invalidation of list + detail, toast), `useDeleteServidor` (invalidation, toast), `useReativarServidor` (invalidation, toast)
    - Test files: `src/hooks/servidores/__tests__/useServidores.test.ts`, `useCreateServidor.test.ts`, `useUpdateServidor.test.ts`, `useDeleteServidor.test.ts`, `useReativarServidor.test.ts`
    - _Requirements: 11.1, 12.5, 12.6, 12.7, 13.5, 13.6, 14.3, 14.4, 15.2, 15.3, 20.2, 20.3_

- [x] 11. Verify i18n completeness and namespace registration
  - [x] 11.1 Verify and update `src/i18n/locales/en/cargos.json` and `src/i18n/locales/pt-BR/cargos.json`
    - Ensure all keys exist: page title, table headers, action labels, form labels, status labels, toast messages (created, updated, deleted, reativado, duplicateName, notFound)
    - Ensure `cargos` namespace is registered in `src/i18n/config.ts`
    - _Requirements: 17.1, 17.4_

  - [x] 11.2 Verify and update `src/i18n/locales/en/lotacoes.json` and `src/i18n/locales/pt-BR/lotacoes.json`
    - Ensure all keys exist: page title, table headers, action labels, form labels, status labels, toast messages
    - Ensure `lotacoes` namespace is registered in `src/i18n/config.ts`
    - _Requirements: 17.2, 17.4_

  - [x] 11.3 Verify and update `src/i18n/locales/en/servidores.json` and `src/i18n/locales/pt-BR/servidores.json`
    - Ensure all keys exist: page title, table headers (including CPF, cargo, lotação, papéis), action labels, form labels (including cpfReadOnly, emailReadOnly), role labels, status labels, toast messages (created, updated, deleted, reativado, duplicate, invalidData, dependencyNotFound)
    - Ensure `servidores` namespace is registered in `src/i18n/config.ts`
    - _Requirements: 17.3, 17.4_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each domain
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error handling flows
- Implementation order (Cargos → Lotações → Servidores) respects foreign key dependencies
- Many files already exist — tasks focus on gaps, wiring, and review rather than creation from scratch
