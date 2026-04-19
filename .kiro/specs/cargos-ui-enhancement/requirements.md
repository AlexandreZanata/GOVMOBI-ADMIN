# Requirements Document

## Introduction

This feature standardizes the Cargos page UI to match the established pattern already implemented in the Motoristas and Lotações pages. The work covers: replacing text-based action buttons with fixed icon buttons; creating a `CargoViewModal` component; adding search-by-name functionality; updating the toolbar, table container, and dialog components to use the shared `Modal` base component; and adding the missing `"view"` i18n key to both locale files.

All changes are purely presentational and behavioral — no API contract changes are required.

## Glossary

- **CargosPageClient**: The client-side React organism that renders the Cargos management page, including toolbar, table, and dialogs.
- **CargoViewModal**: A read-only modal that displays the full details of a single `Cargo` record.
- **CargoFormDialog**: The create/edit form modal for a `Cargo` record.
- **CargoDeleteDialog**: The soft-delete confirmation modal for a `Cargo` record.
- **Modal**: The shared base modal component located at `src/components/molecules/Modal.tsx`, accepting `open`, `onClose`, `title`, `subtitle`, `children`, `footer`, and `maxWidth` props.
- **Cargo**: The domain entity `{ id, nome, pesoPrioridade, ativo, createdAt, updatedAt, deletedAt }`.
- **Icon Button**: A `<button>` element rendered with an inline SVG icon, always visible (not hover-only), with `aria-label` and `title` attributes.
- **Toolbar**: The container row holding the search input and filter pills, styled with `rounded-xl border bg-white shadow-sm`.
- **Filter Pill**: A `<button>` with `aria-pressed` that toggles the `AtivoFilter` state (`all` | `active` | `inactive`).
- **AtivoFilter**: The union type `"all" | "active" | "inactive"` from `src/lib/filterByAtivo.ts`.
- **Can**: The permission-gate component at `src/components/auth/Can.tsx`.
- **Permission**: The enum from `src/models` containing `CARGO_VIEW`, `CARGO_CREATE`, `CARGO_EDIT`, `CARGO_DELETE`, `CARGO_REATIVAR`.

---

## Requirements

### Requirement 1: Replace Text Action Buttons with Fixed Icon Buttons

**User Story:** As an administrator, I want to see icon buttons for each row action, so that the Cargos table is visually consistent with the Motoristas and Lotações pages.

#### Acceptance Criteria

1. THE `CargosPageClient` SHALL render four icon buttons per row: View (Eye), Edit (Pencil), Desativar (Circle-slash), and Reativar (Rotate-cw).
2. WHEN a `Cargo` record has `ativo === true`, THE `CargosPageClient` SHALL display the Desativar icon button and SHALL NOT display the Reativar icon button for that row.
3. WHEN a `Cargo` record has `ativo === false`, THE `CargosPageClient` SHALL display the Reativar icon button and SHALL NOT display the Desativar icon button for that row.
4. THE `CargosPageClient` SHALL render each icon button with an `aria-label` attribute equal to the corresponding i18n action key value.
5. THE `CargosPageClient` SHALL render each icon button with a `title` attribute equal to the corresponding i18n action key value.
6. THE `CargosPageClient` SHALL render icon buttons as always visible, without requiring a hover state to appear.
7. THE `CargosPageClient` SHALL wrap the Edit icon button in a `Can` component gated on `Permission.CARGO_EDIT`.
8. THE `CargosPageClient` SHALL wrap the Desativar icon button in a `Can` component gated on `Permission.CARGO_DELETE`.
9. THE `CargosPageClient` SHALL wrap the Reativar icon button in a `Can` component gated on `Permission.CARGO_REATIVAR`.
10. THE `CargosPageClient` SHALL render the View icon button without a permission gate (visible to all users with `CARGO_VIEW`).

---

### Requirement 2: Create CargoViewModal Component

**User Story:** As an administrator, I want to open a read-only detail modal for a cargo, so that I can inspect all its fields without entering edit mode.

#### Acceptance Criteria

1. THE `CargoViewModal` SHALL use the `Modal` base component with `maxWidth="max-w-4xl"`.
2. THE `CargoViewModal` SHALL accept props: `open: boolean`, `onClose: () => void`, `cargo: Cargo | undefined`, and `data-testid?: string`.
3. WHEN `cargo` is `undefined`, THE `CargoViewModal` SHALL return `null`.
4. THE `CargoViewModal` SHALL display the cargo's `nome` as the modal title.
5. THE `CargoViewModal` SHALL display a status badge reflecting `cargo.ativo` using the same styling as `LotacaoViewModal` (green ring for active, neutral ring for inactive).
6. WHEN `cargo.deletedAt` is not `null`, THE `CargoViewModal` SHALL display an additional "Desativado em" badge with the formatted date.
7. THE `CargoViewModal` SHALL render a "Dados Básicos" section containing fields for `nome` (label: `t("form.nome")`) and `pesoPrioridade` (label: `t("form.pesoPrioridade")`).
8. THE `CargoViewModal` SHALL render an "Identificação do registro" section containing a field for `id` (label: "ID").
9. THE `CargoViewModal` SHALL render an "Auditoria" section containing fields for `createdAt` (label: "Criado em"), `updatedAt` (label: "Atualizado em"), and `deletedAt` (label: "Excluído em").
10. THE `CargoViewModal` SHALL format all date fields using `pt-BR` locale with day, month, year, hour, minute, and second.
11. WHEN `cargo.deletedAt` is `null`, THE `CargoViewModal` SHALL display "—" for the "Excluído em" field.
12. THE `CargoViewModal` SHALL use black titles (`text-neutral-900`) for field labels and gray values (`text-neutral-400`) for field values.

---

### Requirement 3: Add Search Functionality

**User Story:** As an administrator, I want to filter the cargos list by name, so that I can quickly locate a specific cargo.

#### Acceptance Criteria

1. THE `CargosPageClient` SHALL render a search `<input>` with `type="search"` in the toolbar.
2. THE `CargosPageClient` SHALL filter the displayed cargo rows by `nome` using a case-insensitive substring match against the search term.
3. WHEN the search input is empty, THE `CargosPageClient` SHALL display all cargos that match the active `AtivoFilter`.
4. WHEN the search term matches no cargos, THE `CargosPageClient` SHALL display the empty state section.
5. THE `CargosPageClient` SHALL apply search filtering after the `AtivoFilter` is applied, so both filters compose correctly.
6. THE `CargosPageClient` SHALL derive the filtered list using `useMemo` to avoid unnecessary re-computation.
7. THE `CargosPageClient` SHALL render the search input with `data-testid="cargos-search"`, `aria-label="Buscar cargos"`, and `placeholder="Buscar por nome..."`.

---

### Requirement 4: Update Toolbar Layout

**User Story:** As an administrator, I want the Cargos toolbar to match the Motoristas and Lotações toolbar pattern, so that the admin panel has a consistent visual language.

#### Acceptance Criteria

1. THE `CargosPageClient` SHALL render the toolbar as a flex container with class `rounded-xl border border-neutral-200 bg-white p-4 shadow-sm`.
2. THE `CargosPageClient` SHALL place the search input on the left side of the toolbar, occupying available flex space (`flex-1`).
3. THE `CargosPageClient` SHALL place the filter pills on the right side of the toolbar.
4. THE `CargosPageClient` SHALL render a vertical divider (`h-6 w-px bg-neutral-200`) between the search input and the filter pills on `sm` and wider viewports.
5. THE `CargosPageClient` SHALL render filter pills with `aria-pressed` reflecting the active filter state.

---

### Requirement 5: Update Table Container Styling

**User Story:** As an administrator, I want the Cargos table container to match the Lotações table container styling, so that all management tables look consistent.

#### Acceptance Criteria

1. THE `CargosPageClient` SHALL render the table container `<div>` with classes `overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm`.
2. THE `CargosPageClient` SHALL assign `data-testid="cargos-table"` to the table container `<div>`.

---

### Requirement 6: Migrate CargoFormDialog to Modal Base Component

**User Story:** As a developer, I want `CargoFormDialog` to use the shared `Modal` base component, so that all form dialogs share consistent structure, accessibility, and styling.

#### Acceptance Criteria

1. THE `CargoFormDialog` SHALL use the `Modal` base component as its root container with `maxWidth="max-w-4xl"`.
2. THE `CargoFormDialog` SHALL pass the form title to the `Modal` `title` prop.
3. THE `CargoFormDialog` SHALL pass the Cancel and Submit buttons to the `Modal` `footer` prop.
4. THE `CargoFormDialog` SHALL render the `nome` and `pesoPrioridade` inputs inside a `<form>` with a 2-column grid layout (`sm:grid-cols-2`) within the `Modal` body.
5. WHEN `open` is `false`, THE `CargoFormDialog` SHALL return `null` (delegated to the `Modal` component).
6. WHEN the API returns HTTP 409, THE `CargoFormDialog` SHALL display the duplicate-name error inline on the `nome` field without closing the modal.
7. WHEN the form is submitted successfully, THE `CargoFormDialog` SHALL call `onClose`.

---

### Requirement 7: Migrate CargoDeleteDialog to Modal Base Component

**User Story:** As a developer, I want `CargoDeleteDialog` to use the shared `Modal` base component, so that all confirmation dialogs share consistent structure, accessibility, and styling.

#### Acceptance Criteria

1. THE `CargoDeleteDialog` SHALL use the `Modal` base component as its root container.
2. THE `CargoDeleteDialog` SHALL pass `t("actions.delete")` as the `Modal` `title` prop.
3. THE `CargoDeleteDialog` SHALL pass the Cancel and Confirm buttons to the `Modal` `footer` prop.
4. THE `CargoDeleteDialog` SHALL render the confirmation message and reversibility note as the `Modal` body content.
5. WHEN the deletion is confirmed successfully, THE `CargoDeleteDialog` SHALL call `onClose`.
6. WHEN `open` is `false`, THE `CargoDeleteDialog` SHALL return `null` (delegated to the `Modal` component).

---

### Requirement 8: Add "view" i18n Key

**User Story:** As a developer, I want the `"view"` action key to exist in both locale files, so that the View icon button has a translated `aria-label` and `title`.

#### Acceptance Criteria

1. THE `pt-BR/cargos.json` file SHALL contain `"view": "Visualizar"` under the `"actions"` object.
2. THE `en/cargos.json` file SHALL contain `"view": "View"` under the `"actions"` object.
3. THE `CargosPageClient` SHALL use `t("actions.view")` as the `aria-label` and `title` for the View icon button.
