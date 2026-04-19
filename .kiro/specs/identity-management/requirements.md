# Requirements Document

## Introduction

The Identity Management feature provides full CRUD operations for three interconnected domains in GOVMOBI-ADMIN: **Cargos** (job positions), **Lotações** (organizational units), and **Servidores** (public servants). Each domain supports listing, creation, editing, soft-delete (deactivation), and reactivation. Servidores depend on both Cargos and Lotações via foreign keys. All API interactions follow the project's Facade pattern (UI → Hook → Facade → API), use the `{ success, data, timestamp }` response envelope, and enforce RBAC via permission gates.

## Glossary

- **Cargo**: A job position with a name and priority weight (e.g., "Auditor Fiscal", pesoPrioridade: 80).
- **Lotação**: An organizational unit (e.g., "Secretaria de Fazenda"). Has no priority weight.
- **Servidor**: A public servant linked to exactly one Cargo and one Lotação, holding one or more system roles (papéis).
- **Papel**: A system role assigned to a Servidor. Valid values: `USUARIO`, `ADMIN`, `MOTORISTA`.
- **Soft-Delete**: Logical deactivation setting `ativo` to `false` and populating `deletedAt`, without physical removal.
- **Reactivation**: Restoring a soft-deleted entity to active status (`ativo: true`, `deletedAt: null`).
- **Facade**: The API abstraction layer that unwraps the `{ success, data, timestamp }` envelope and exposes typed methods to hooks.
- **Admin_Panel**: The GOVMOBI-ADMIN Next.js frontend application.
- **API_Envelope**: The standard response wrapper `{ success: boolean, data: T, timestamp: string }` used by all backend endpoints.
- **Permission_Gate**: A UI-level access control mechanism using the `<Can>` component or `usePermissions()` hook.
- **CPF**: Brazilian individual taxpayer registration number (11 digits).

## Requirements

### Requirement 1: List Cargos

**User Story:** As an admin, I want to view all cargos in a table, so that I can see existing job positions and their priority weights.

#### Acceptance Criteria

1. WHEN the Cargos page loads, THE Admin_Panel SHALL fetch all cargos from `GET /cargos` via the Cargos_Facade and display them in a table with columns: Name, Priority Weight, Status, and Actions.
2. WHILE the cargos data is loading, THE Admin_Panel SHALL display skeleton placeholder rows.
3. IF the cargos fetch fails, THEN THE Admin_Panel SHALL display an error state with a retry button that re-fetches the data.
4. IF the cargos list is empty, THEN THE Admin_Panel SHALL display an empty state message with guidance to create the first cargo.
5. THE Admin_Panel SHALL provide a client-side filter toggle with options All, Active, and Inactive that filters the displayed cargos by their `ativo` field.

### Requirement 2: Create Cargo

**User Story:** As an admin, I want to create a new cargo, so that I can define job positions for servidores.

#### Acceptance Criteria

1. WHEN the user clicks the "New Cargo" button, THE Admin_Panel SHALL open a form dialog with fields: nome (text, required, max 100 characters) and pesoPrioridade (number, required, min 0, max 100).
2. WHERE the user has the `cargo:create` permission, THE Admin_Panel SHALL display the "New Cargo" button.
3. WHEN the user submits a valid cargo form, THE Admin_Panel SHALL send a `POST /cargos` request via the Cargos_Facade and close the dialog on success.
4. WHEN a cargo is created successfully, THE Admin_Panel SHALL invalidate the cargos list query and display a success toast notification.
5. IF the API returns HTTP 409 (duplicate name), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating the name already exists.

### Requirement 3: Update Cargo

**User Story:** As an admin, I want to edit an existing cargo, so that I can correct or update job position details.

#### Acceptance Criteria

1. WHERE the user has the `cargo:edit` permission, THE Admin_Panel SHALL display an edit button on each cargo row.
2. WHEN the user clicks the edit button, THE Admin_Panel SHALL open the cargo form dialog pre-populated with the current cargo data.
3. WHEN the user submits the updated cargo form, THE Admin_Panel SHALL send a `PUT /cargos/{id}` request via the Cargos_Facade and close the dialog on success.
4. WHEN a cargo is updated successfully, THE Admin_Panel SHALL invalidate both the cargos list query and the cargo detail query for the updated ID.
5. IF the API returns HTTP 409 (duplicate name), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating the name already exists.
6. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the cargo was not found.

### Requirement 4: Soft-Delete Cargo

**User Story:** As an admin, I want to deactivate a cargo, so that it is no longer available for assignment without permanently removing it.

#### Acceptance Criteria

1. WHERE the user has the `cargo:delete` permission, THE Admin_Panel SHALL display a deactivate button on each active cargo row.
2. WHEN the user clicks the deactivate button, THE Admin_Panel SHALL open a confirmation dialog stating the action can be reversed.
3. WHEN the user confirms the deactivation, THE Admin_Panel SHALL send a `DELETE /cargos/{id}` request via the Cargos_Facade.
4. WHEN a cargo is deactivated successfully, THE Admin_Panel SHALL invalidate the cargos list query and display a success toast notification.
5. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the cargo was not found.

### Requirement 5: Reactivate Cargo

**User Story:** As an admin, I want to reactivate a deactivated cargo, so that it becomes available for assignment again.

#### Acceptance Criteria

1. WHERE the user has the `cargo:reativar` permission, THE Admin_Panel SHALL display a reactivate button on each inactive cargo row instead of the deactivate button.
2. WHEN the user clicks the reactivate button, THE Admin_Panel SHALL send a `PATCH /cargos/{id}/reativar` request via the Cargos_Facade.
3. WHEN a cargo is reactivated successfully, THE Admin_Panel SHALL invalidate the cargos list query and display a success toast notification.
4. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the cargo was not found.

### Requirement 6: List Lotações

**User Story:** As an admin, I want to view all lotações in a table, so that I can see existing organizational units.

#### Acceptance Criteria

1. WHEN the Lotações page loads, THE Admin_Panel SHALL fetch all lotações from `GET /lotacoes` via the Lotacoes_Facade and display them in a table with columns: Name, Status, and Actions.
2. WHILE the lotações data is loading, THE Admin_Panel SHALL display skeleton placeholder rows.
3. IF the lotações fetch fails, THEN THE Admin_Panel SHALL display an error state with a retry button that re-fetches the data.
4. IF the lotações list is empty, THEN THE Admin_Panel SHALL display an empty state message with guidance to create the first lotação.
5. THE Admin_Panel SHALL provide a client-side filter toggle with options All, Active, and Inactive that filters the displayed lotações by their `ativo` field.

### Requirement 7: Create Lotação

**User Story:** As an admin, I want to create a new lotação, so that I can define organizational units for servidores.

#### Acceptance Criteria

1. WHEN the user clicks the "New Lotação" button, THE Admin_Panel SHALL open a form dialog with the field: nome (text, required, max 100 characters).
2. WHERE the user has the `lotacao:create` permission, THE Admin_Panel SHALL display the "New Lotação" button.
3. WHEN the user submits a valid lotação form, THE Admin_Panel SHALL send a `POST /lotacoes` request via the Lotacoes_Facade and close the dialog on success.
4. WHEN a lotação is created successfully, THE Admin_Panel SHALL invalidate the lotações list query and display a success toast notification.
5. IF the API returns HTTP 409 (duplicate name), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating the name already exists.

### Requirement 8: Update Lotação

**User Story:** As an admin, I want to edit an existing lotação, so that I can correct or update organizational unit details.

#### Acceptance Criteria

1. WHERE the user has the `lotacao:edit` permission, THE Admin_Panel SHALL display an edit button on each lotação row.
2. WHEN the user clicks the edit button, THE Admin_Panel SHALL open the lotação form dialog pre-populated with the current lotação data.
3. WHEN the user submits the updated lotação form, THE Admin_Panel SHALL send a `PUT /lotacoes/{id}` request via the Lotacoes_Facade and close the dialog on success.
4. WHEN a lotação is updated successfully, THE Admin_Panel SHALL invalidate both the lotações list query and the lotação detail query for the updated ID.
5. IF the API returns HTTP 409 (duplicate name), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating the name already exists.
6. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the lotação was not found.

### Requirement 9: Soft-Delete Lotação

**User Story:** As an admin, I want to deactivate a lotação, so that it is no longer available for assignment without permanently removing it.

#### Acceptance Criteria

1. WHERE the user has the `lotacao:delete` permission, THE Admin_Panel SHALL display a deactivate button on each active lotação row.
2. WHEN the user clicks the deactivate button, THE Admin_Panel SHALL open a confirmation dialog stating the action can be reversed.
3. WHEN the user confirms the deactivation, THE Admin_Panel SHALL send a `DELETE /lotacoes/{id}` request via the Lotacoes_Facade.
4. WHEN a lotação is deactivated successfully, THE Admin_Panel SHALL invalidate the lotações list query and display a success toast notification.
5. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the lotação was not found.

### Requirement 10: Reactivate Lotação

**User Story:** As an admin, I want to reactivate a deactivated lotação, so that it becomes available for assignment again.

#### Acceptance Criteria

1. WHERE the user has the `lotacao:reativar` permission, THE Admin_Panel SHALL display a reactivate button on each inactive lotação row instead of the deactivate button.
2. WHEN the user clicks the reactivate button, THE Admin_Panel SHALL send a `PATCH /lotacoes/{id}/reativar` request via the Lotacoes_Facade.
3. WHEN a lotação is reactivated successfully, THE Admin_Panel SHALL invalidate the lotações list query and display a success toast notification.
4. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the lotação was not found.

### Requirement 11: List Servidores

**User Story:** As an admin, I want to view all servidores in a table, so that I can see registered public servants and their assignments.

#### Acceptance Criteria

1. WHEN the Servidores page loads, THE Admin_Panel SHALL fetch all servidores from `GET /servidores` via the Servidores_Facade and display them in a table with columns: Name, CPF (formatted), Email, Cargo, Lotação, Roles (as badges), Status, and Actions.
2. THE Admin_Panel SHALL display CPF values formatted as `XXX.XXX.XXX-XX` on render while storing the raw 11-digit string.
3. WHILE the servidores data is loading, THE Admin_Panel SHALL display skeleton placeholder rows.
4. IF the servidores fetch fails, THEN THE Admin_Panel SHALL display an error state with a retry button that re-fetches the data.
5. IF the servidores list is empty, THEN THE Admin_Panel SHALL display an empty state message with guidance to create the first servidor.
6. THE Admin_Panel SHALL provide a client-side filter toggle with options All, Active, and Inactive that filters the displayed servidores by their `ativo` field.

### Requirement 12: Create Servidor

**User Story:** As an admin, I want to register a new servidor, so that I can add public servants to the system with their cargo, lotação, and roles.

#### Acceptance Criteria

1. WHEN the user clicks the "New Servidor" button, THE Admin_Panel SHALL open a form dialog with fields: nome (text, required), cpf (text, required, 11 digits), email (email, required), telefone (text, required), cargoId (select, required), lotacaoId (select, required), and papéis (multi-select, required, at least one value).
2. WHERE the user has the `servidor:create` permission, THE Admin_Panel SHALL display the "New Servidor" button.
3. THE Admin_Panel SHALL populate the cargoId select with only active cargos fetched via the Cargos_Facade.
4. THE Admin_Panel SHALL populate the lotacaoId select with only active lotações fetched via the Lotacoes_Facade.
5. WHEN the user submits a valid servidor form, THE Admin_Panel SHALL send a `POST /servidores` request via the Servidores_Facade and close the dialog on success.
6. WHEN a servidor is created successfully, THE Admin_Panel SHALL invalidate the servidores list query and display a success toast notification.
7. IF the API returns HTTP 409 (duplicate CPF or email), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating the CPF or email is already registered.
8. IF the API returns HTTP 400 (invalid data), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating invalid CPF, email, or roles.
9. IF the API returns HTTP 404 (cargo or lotação not found), THEN THE Admin_Panel SHALL keep the dialog open and display an inline error indicating the referenced cargo or lotação was not found.

### Requirement 13: Update Servidor

**User Story:** As an admin, I want to edit an existing servidor, so that I can update their assignment, phone, or roles.

#### Acceptance Criteria

1. WHERE the user has the `servidor:edit` permission, THE Admin_Panel SHALL display an edit button on each servidor row.
2. WHEN the user clicks the edit button, THE Admin_Panel SHALL open the servidor form dialog pre-populated with the current servidor data.
3. THE Admin_Panel SHALL render the CPF and email fields as read-only (disabled) in edit mode.
4. THE Admin_Panel SHALL allow editing of nome, telefone, cargoId, lotacaoId, and papéis fields in edit mode.
5. WHEN the user submits the updated servidor form, THE Admin_Panel SHALL send a `PUT /servidores/{id}` request via the Servidores_Facade containing only the changed fields, and close the dialog on success.
6. WHEN a servidor is updated successfully, THE Admin_Panel SHALL invalidate both the servidores list query and the servidor detail query for the updated ID.
7. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the servidor, cargo, or lotação was not found.

### Requirement 14: Soft-Delete Servidor

**User Story:** As an admin, I want to deactivate a servidor, so that the servant is no longer active in the system without permanently removing their record.

#### Acceptance Criteria

1. WHERE the user has the `servidor:delete` permission, THE Admin_Panel SHALL display a deactivate button on each active servidor row.
2. WHEN the user clicks the deactivate button, THE Admin_Panel SHALL open a confirmation dialog stating the action can be reversed.
3. WHEN the user confirms the deactivation, THE Admin_Panel SHALL send a `DELETE /servidores/{id}` request via the Servidores_Facade.
4. WHEN a servidor is deactivated successfully, THE Admin_Panel SHALL invalidate the servidores list query and display a success toast notification.
5. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the servidor was not found.

### Requirement 15: Reactivate Servidor

**User Story:** As an admin, I want to reactivate a deactivated servidor, so that the servant becomes active in the system again.

#### Acceptance Criteria

1. WHERE the user has the `servidor:reativar` permission, THE Admin_Panel SHALL display a reactivate button on each inactive servidor row instead of the deactivate button.
2. WHEN the user clicks the reactivate button, THE Admin_Panel SHALL send a `PATCH /servidores/{id}/reativar` request via the Servidores_Facade.
3. WHEN a servidor is reactivated successfully, THE Admin_Panel SHALL invalidate the servidores list query and display a success toast notification.
4. IF the API returns HTTP 404, THEN THE Admin_Panel SHALL display a toast notification indicating the servidor was not found.

### Requirement 16: API Envelope Unwrapping

**User Story:** As a developer, I want all facades to unwrap the API response envelope, so that hooks and components receive clean domain objects.

#### Acceptance Criteria

1. THE Cargos_Facade SHALL unwrap the `data` field from every API response envelope `{ success, data, timestamp }` before returning the result to the calling hook.
2. THE Lotacoes_Facade SHALL unwrap the `data` field from every API response envelope `{ success, data, timestamp }` before returning the result to the calling hook.
3. THE Servidores_Facade SHALL unwrap the `data` field from every API response envelope `{ success, data, timestamp }` before returning the result to the calling hook.

### Requirement 17: Internationalization

**User Story:** As a developer, I want all user-visible strings to use i18n keys, so that the application supports future localization.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use `useTranslation("cargos")` for all user-visible strings on the Cargos page, including page title, table headers, action labels, form labels, status labels, and toast messages.
2. THE Admin_Panel SHALL use `useTranslation("lotacoes")` for all user-visible strings on the Lotações page, including page title, table headers, action labels, form labels, status labels, and toast messages.
3. THE Admin_Panel SHALL use `useTranslation("servidores")` for all user-visible strings on the Servidores page, including page title, table headers, action labels, form labels, status labels, role labels, and toast messages.
4. THE Admin_Panel SHALL register the `cargos`, `lotacoes`, and `servidores` namespaces in the i18n configuration.

### Requirement 18: Permission Gates

**User Story:** As an admin, I want UI actions to be gated by permissions, so that users only see actions they are authorized to perform.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use the `<Can>` component or `usePermissions()` hook to gate all create, edit, delete, and reactivate actions across the Cargos, Lotações, and Servidores domains.
2. THE Admin_Panel SHALL define the following permissions in the Permission enum: `cargo:view`, `cargo:create`, `cargo:edit`, `cargo:delete`, `cargo:reativar`, `lotacao:view`, `lotacao:create`, `lotacao:edit`, `lotacao:delete`, `lotacao:reativar`, `servidor:view`, `servidor:create`, `servidor:edit`, `servidor:delete`, `servidor:reativar`.

### Requirement 19: MSW Mock Layer

**User Story:** As a developer, I want MSW handlers for all identity management endpoints, so that I can develop and test the frontend without a running backend.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide MSW handlers for all six Cargos endpoints that return responses matching the `{ success, data, timestamp }` envelope with realistic latency between 200ms and 500ms.
2. THE Admin_Panel SHALL provide MSW handlers for all six Lotações endpoints that return responses matching the `{ success, data, timestamp }` envelope with realistic latency between 200ms and 500ms.
3. THE Admin_Panel SHALL provide MSW handlers for all six Servidores endpoints that return responses matching the `{ success, data, timestamp }` envelope with realistic latency between 200ms and 500ms.
4. THE Admin_Panel SHALL register all identity management MSW handlers in the test server setup.

### Requirement 20: Data Flow Compliance

**User Story:** As a developer, I want all identity management features to follow the project's layered architecture, so that the codebase remains consistent and maintainable.

#### Acceptance Criteria

1. THE Admin_Panel SHALL follow the data flow UI Component → Custom Hook → Facade → API for all identity management data operations.
2. THE Admin_Panel SHALL use TanStack Query `useQuery` for all list and detail data fetching across the three domains.
3. THE Admin_Panel SHALL use TanStack Query `useMutation` for all create, update, delete, and reactivate operations across the three domains.
4. THE Admin_Panel SHALL use query key factories (`cargosKeys`, `lotacoesKeys`, `servidoresKeys`) for all TanStack Query cache management.
