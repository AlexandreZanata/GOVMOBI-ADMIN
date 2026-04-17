# Implementation Plan: Lotações UI Enhancement

## Overview

This implementation plan breaks down the Lotações UI enhancement into discrete coding tasks. The enhancement replaces text action buttons with fixed icon buttons, creates a view modal component, adds search functionality, and updates the form dialog width, matching the visual pattern established in the Motoristas page.

## Tasks

- [x] 1. Create LotacaoViewModal component
  - [x] 1.1 Create base component structure with Modal wrapper
    - Create `src/components/molecules/LotacaoViewModal.tsx`
    - Implement LotacaoViewModalProps interface with open, onClose, lotacao, and data-testid props
    - Add early return for undefined lotacao
    - Use Modal component with max-w-4xl width
    - _Requirements: 2.1, 2.2, 2.10_
  
  - [x] 1.2 Implement Section and Field helper components
    - Create Section component for organizing content into titled sections
    - Create Field component for displaying label-value pairs
    - Use same styling as MotoristaViewModal (rounded-xl border, bg-white, p-5)
    - _Requirements: 2.4, 2.11, 5.7_
  
  - [x] 1.3 Add header with lotação nome and status badge
    - Display nome as modal title
    - Add active/inactive status badge with appropriate colors (success for active, neutral for inactive)
    - Use STATUS_CLASSES mapping for badge colors
    - _Requirements: 2.3, 2.5_
  
  - [x] 1.4 Implement "Dados Básicos" section
    - Display nome field
    - Use Field component for consistent formatting
    - _Requirements: 2.4, 2.6_
  
  - [x] 1.5 Implement "Identificação do registro" section
    - Display id field
    - Use Field component for consistent formatting
    - _Requirements: 2.4, 2.7_
  
  - [x] 1.6 Implement "Auditoria" section with timestamp formatting
    - Display createdAt, updatedAt, deletedAt fields
    - Implement formatDate function using pt-BR locale with date and time
    - Add safeFormatDate wrapper with try-catch for error handling
    - Display "—" for null or empty values
    - _Requirements: 2.4, 2.8, 2.9_
  
  - [ ]* 1.7 Write unit tests for LotacaoViewModal
    - Test component renders with lotacao data
    - Test all sections display correctly
    - Test timestamp formatting with pt-BR locale
    - Test status badge based on ativo field
    - Test returns null when lotacao is undefined
    - Test onClose callback is called
    - Test displays "—" for empty or null values

- [x] 2. Update LotacaoRow with icon buttons
  - [x] 2.1 Add View icon button (Eye)
    - Add onView prop to LotacaoRowProps interface
    - Create button element with Eye SVG icon
    - Add aria-label and title attributes using t("actions.view")
    - Use neutral-400 default color, neutral-700 hover color
    - Add data-testid="lotacao-view-{id}"
    - No permission check required (always visible)
    - _Requirements: 1.1, 1.2, 1.6, 1.7, 5.1, 5.2, 5.3, 5.6_
  
  - [x] 2.2 Add Edit icon button (Pencil)
    - Create button element with Pencil SVG icon
    - Add aria-label and title attributes using t("actions.edit")
    - Use neutral-400 default color, brand-primary hover color
    - Add data-testid="lotacao-edit-{id}"
    - Wrap in Can component with LOTACAO_EDIT permission
    - _Requirements: 1.1, 1.3, 1.6, 1.7, 1.8, 5.1, 5.2, 5.3, 5.6_
  
  - [x] 2.3 Add Desativar icon button (Circle-slash)
    - Create button element with Circle-slash SVG icon
    - Add aria-label and title attributes using t("actions.desativar")
    - Use neutral-400 default color, danger hover color
    - Add data-testid="lotacao-desativar-{id}"
    - Wrap in Can component with LOTACAO_DELETE permission
    - Only show when lotacao.ativo is true
    - _Requirements: 1.1, 1.4, 1.6, 1.7, 1.8, 5.1, 5.2, 5.3, 5.6_
  
  - [x] 2.4 Add Reativar icon button (Rotate-cw)
    - Create button element with Rotate-cw SVG icon
    - Add aria-label and title attributes using t("actions.reativar")
    - Use neutral-400 default color, success hover color
    - Add data-testid="lotacao-reativar-{id}"
    - Wrap in Can component with LOTACAO_REATIVAR permission
    - Only show when lotacao.ativo is false
    - _Requirements: 1.1, 1.5, 1.6, 1.7, 1.8, 5.1, 5.2, 5.3, 5.6_
  
  - [x] 2.5 Remove text-based Button components
    - Remove existing text-based Button components for edit, desativar, and reativar actions
    - Ensure all icon buttons are always visible (fixed visibility, no hover pattern)
    - _Requirements: 1.1, 1.6, 5.1_
  
  - [ ]* 2.6 Write unit tests for icon buttons
    - Test all icon buttons render with correct SVG icons
    - Test View button is always visible (no permission check)
    - Test Edit button visibility with LOTACAO_EDIT permission
    - Test Desativar button visibility with LOTACAO_DELETE permission and ativo=true
    - Test Reativar button visibility with LOTACAO_REATIVAR permission and ativo=false
    - Test aria-label and title attributes are correct
    - Test each button calls correct callback with lotacao data

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Add search functionality to LotacoesPageClient
  - [x] 4.1 Add search state and input field
    - Add search state variable: useState("")
    - Import Search icon from lucide-react
    - Add search input field in toolbar with Search icon on left
    - Add placeholder text "Buscar por nome..."
    - Add aria-label attribute "Buscar lotações"
    - Add data-testid="lotacoes-search"
    - _Requirements: 3.1, 3.5, 3.6, 3.7, 5.3_
  
  - [x] 4.2 Implement search filtering logic
    - Create filtered memoized value using useMemo
    - Filter byStatus results by nome field (case-insensitive)
    - Return all byStatus results when search term is empty
    - Update table to use filtered results instead of byStatus
    - _Requirements: 3.2, 3.3, 3.4, 3.8_
  
  - [x] 4.3 Update toolbar layout to match Motoristas page
    - Place search input on the left side of toolbar
    - Place filter pills on the right side of toolbar
    - Use flex layout with gap spacing
    - Ensure responsive behavior on mobile screens
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 4.4 Write unit tests for search functionality
    - Test search input filters lotações by nome (case-insensitive)
    - Test empty search shows all lotações (filtered by status)
    - Test search updates results as user types
    - Test search works in combination with status filter
    - Test search input has correct placeholder and aria-label

- [x] 5. Update table container styling
  - [x] 5.1 Update table container classes
    - Add rounded-xl border to table container
    - Add shadow-sm to table container
    - Update border color to border-neutral-200
    - Ensure overflow-hidden is preserved
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 5.2 Verify visual consistency with Motoristas page
    - Compare toolbar layout with MotoristasPageClient
    - Compare table container styling with MotoristasPageClient
    - Compare filter pills styling with MotoristasPageClient
    - Verify all spacing and padding values match
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Update LotacaoFormDialog width
  - [x] 6.1 Update modal width
    - Change Modal maxWidth prop from "max-w-md" to "max-w-4xl"
    - Maintain existing single-column layout (no grid changes)
    - Verify form still displays correctly
    - _Requirements: 4.1, 4.2_
  
  - [x] 6.2 Verify existing functionality is preserved
    - Verify all validation logic still works
    - Verify API integration with lotacoesFacade is unchanged
    - Verify error handling is preserved
    - Verify loading states are preserved
    - _Requirements: 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 6.3 Write unit tests for form layout
    - Test modal renders with max-w-4xl width
    - Test form maintains single-column layout
    - Test all validation logic is preserved
    - Test API integration is preserved

- [x] 7. Wire view action in LotacoesPageClient
  - [x] 7.1 Add viewTarget state and LotacaoViewModal
    - Add viewTarget state variable: useState<Lotacao | undefined>()
    - Import LotacaoViewModal component
    - Add LotacaoViewModal JSX with open, onClose, lotacao, and data-testid props
    - Pass onView={setViewTarget} callback to LotacaoRow
    - _Requirements: 2.1, 2.2_
  
  - [x] 7.2 Test view action end-to-end flow
    - Verify clicking Eye icon button opens LotacaoViewModal
    - Verify modal displays correct lotacao data
    - Verify closing modal clears viewTarget state
    - Verify modal handles undefined lotacao gracefully
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 7.3 Write integration tests for view action
    - Test clicking view button opens modal with correct data
    - Test modal closes and clears viewTarget state
    - Test modal handles undefined lotacao gracefully

- [x] 8. Add internationalization keys
  - [x] 8.1 Add "view" key to translation files
    - Add "view": "Visualizar" to src/i18n/locales/pt-BR/lotacoes.json under "actions"
    - Add "view": "View" to src/i18n/locales/en-US/lotacoes.json under "actions" (if file exists)
    - Verify translations load correctly in View icon button
    - _Requirements: 1.2, 1.7_

- [x] 9. Final testing and verification
  - [x] 9.1 Verify visual consistency with Motoristas page
    - Compare icon button styling with MotoristasPageClient
    - Compare view modal layout with MotoristaViewModal
    - Compare toolbar layout with MotoristasPageClient
    - Compare search input styling with MotoristasPageClient
    - Verify all colors, spacing, and typography match
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [x] 9.2 Verify all existing functionality is preserved
    - Test all CRUD operations (create, edit, desativar, reativar)
    - Test all permission checks using Can component
    - Test status filter functionality (all/active/inactive)
    - Test search and filter work together correctly
    - Test API endpoints integration
    - Test error handling
    - Test loading states and empty states
    - Verify all data-testid attributes are preserved
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [ ]* 9.3 Run accessibility tests
    - Verify all icon buttons have aria-label attributes
    - Verify all icon buttons have title attributes for tooltips
    - Verify search input has aria-label attribute
    - Verify modal has proper aria-modal and role="dialog"
    - Test keyboard navigation (Tab, Escape)
    - Test focus management (modal traps focus, returns focus on close)
    - Verify color contrast meets WCAG AA requirements
  
  - [ ]* 9.4 Test responsive behavior
    - Test icon buttons on mobile and desktop
    - Test view modal on mobile and desktop
    - Test search input on mobile and desktop
    - Test toolbar layout on mobile and desktop
    - Verify all breakpoints work correctly

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- All icon buttons use inline SVG for better performance
- The design uses TypeScript/React, so all code will be written in TypeScript
- No property-based tests are included as this is a UI-focused feature with no complex business logic
- Search functionality is implemented with client-side filtering using useMemo for performance
