# Requirements Document

## Introduction

This feature enhances the Lotações page UI to match the established pattern from the Motoristas page. The enhancement includes replacing hover-based text buttons with always-visible icon buttons, adding a view modal for lotação details, implementing search functionality, and updating the form dialog layout for visual consistency.

## Glossary

- **Lotações_Page**: The client-side page component that displays and manages lotações (assignment/location units)
- **Icon_Button**: A button displaying only an icon (eye, pencil, circle-slash, rotate-cw) that is always visible, not on hover
- **View_Modal**: A modal dialog that displays all lotação fields in organized sections with read-only access
- **Search_Input**: A text input field that filters the lotação table by nome (name)
- **Form_Dialog**: A modal dialog for creating or editing lotação records
- **Lotação**: An assignment or location unit entity with fields: id, nome, ativo, createdAt, updatedAt, deletedAt

## Requirements

### Requirement 1: Replace Text Buttons with Icon Buttons

**User Story:** As a user, I want to see action buttons as icons that are always visible, so that I can quickly identify and access actions without hovering.

#### Acceptance Criteria

1. THE Lotações_Page SHALL replace hover-based text buttons with fixed icon buttons
2. THE Icon_Button for view SHALL display an eye icon
3. THE Icon_Button for edit SHALL display a pencil icon
4. THE Icon_Button for desativar (deactivate) SHALL display a circle-slash icon
5. THE Icon_Button for reativar (reactivate) SHALL display a rotate-cw icon
6. THE Icon_Button SHALL be visible at all times without requiring hover interaction
7. THE Icon_Button SHALL include aria-label and title attributes for accessibility
8. THE Icon_Button SHALL use consistent styling with neutral-400 text color and hover state transitions

### Requirement 2: Add View Modal Component

**User Story:** As a user, I want to view all lotação details in a modal, so that I can review complete information without editing.

#### Acceptance Criteria

1. THE Lotações_Page SHALL include a LotacaoViewModal component
2. WHEN a user clicks the eye icon button, THE Lotações_Page SHALL open the LotacaoViewModal
3. THE LotacaoViewModal SHALL display the lotação nome as the modal title
4. THE LotacaoViewModal SHALL organize fields into sections: Status, Dados Básicos, Identificação do registro, and Auditoria
5. THE LotacaoViewModal SHALL display the ativo status with a colored badge (success for active, neutral for inactive)
6. THE LotacaoViewModal SHALL display the nome field in the Dados Básicos section
7. THE LotacaoViewModal SHALL display the id field in the Identificação do registro section
8. THE LotacaoViewModal SHALL display createdAt, updatedAt, and deletedAt fields in the Auditoria section
9. THE LotacaoViewModal SHALL format date fields using pt-BR locale with day/month/year and time
10. THE LotacaoViewModal SHALL use max-w-4xl width for consistency with other view modals
11. THE LotacaoViewModal SHALL use black titles and gray values with single sans-serif font

### Requirement 3: Add Search Functionality

**User Story:** As a user, I want to search lotações by name, so that I can quickly find specific records.

#### Acceptance Criteria

1. THE Lotações_Page SHALL include a Search_Input field in the toolbar
2. THE Search_Input SHALL filter the lotação table by nome field
3. THE Search_Input SHALL perform case-insensitive matching
4. THE Search_Input SHALL update the filtered results as the user types
5. THE Search_Input SHALL display a search icon on the left side
6. THE Search_Input SHALL include placeholder text "Buscar por nome..."
7. THE Search_Input SHALL include aria-label attribute for accessibility
8. WHEN the search term is empty, THE Lotações_Page SHALL display all lotações matching the current status filter

### Requirement 4: Update Form Dialog Layout

**User Story:** As a developer, I want the lotação form dialog to use a consistent layout, so that all form dialogs in the application have a uniform appearance.

#### Acceptance Criteria

1. THE Form_Dialog SHALL use max-w-4xl width instead of max-w-md
2. THE Form_Dialog SHALL maintain the existing single-column layout for the nome field
3. THE Form_Dialog SHALL preserve all existing form validation logic
4. THE Form_Dialog SHALL preserve all existing form submission behavior

### Requirement 5: Maintain Visual Consistency

**User Story:** As a user, I want the Lotações page to have the same visual style as the Motoristas page, so that the interface feels cohesive.

#### Acceptance Criteria

1. THE Lotações_Page SHALL use rounded-xl borders for the table container
2. THE Lotações_Page SHALL use shadow-sm for the table container
3. THE Lotações_Page SHALL use the same toolbar layout with search input and filter pills
4. THE Lotações_Page SHALL use the same color scheme for status badges and filter pills
5. THE Lotações_Page SHALL use the same spacing and padding values as the Motoristas page
6. THE Icon_Button hover states SHALL use the same color transitions as the Motoristas page
7. THE View_Modal sections SHALL use the same layout structure as MotoristaViewModal

### Requirement 6: Preserve Existing Functionality

**User Story:** As a user, I want all existing lotação management features to continue working, so that I don't lose any functionality.

#### Acceptance Criteria

1. THE Lotações_Page SHALL preserve the create lotação functionality
2. THE Lotações_Page SHALL preserve the edit lotação functionality
3. THE Lotações_Page SHALL preserve the desativar (soft delete) functionality
4. THE Lotações_Page SHALL preserve the reativar functionality
5. THE Lotações_Page SHALL preserve the status filter functionality (all/active/inactive)
6. THE Lotações_Page SHALL preserve permission-based access control using Can component
7. THE Lotações_Page SHALL preserve loading, error, and empty state displays
8. THE Lotações_Page SHALL preserve all existing data-testid attributes for testing
