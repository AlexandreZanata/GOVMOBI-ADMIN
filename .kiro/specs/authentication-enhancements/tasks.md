# Implementation Plan: Authentication Enhancements

## Overview

This implementation plan breaks down the authentication enhancements into discrete, actionable tasks. The work focuses on three core areas:

1. **Token Lifecycle Management**: Enhanced token refresh with mutex pattern, retry logic, and proper error handling
2. **API Coverage**: Complete implementation of the `changePassword` method in the auth facade
3. **User Experience**: Change password functionality with accessible modal dialog

All tasks build incrementally, with checkpoints to ensure quality and correctness at each stage.

## Tasks

- [x] 1. Enhance auth facade with token lifecycle improvements
  - [x] 1.1 Add development-only token lifecycle logging
    - Add console.log statements for token save, clear, refresh initiated, refresh succeeded, and refresh failed
    - Wrap all logging in `process.env.NODE_ENV === "development"` checks
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 1.2 Implement retry logic for token refresh
    - Add MAX_RETRIES constant (value: 2) and RETRY_DELAYS array ([1000, 2000])
    - Modify `refresh()` method to retry on network errors and 5xx responses
    - Do NOT retry on 401 responses (authentication failure)
    - Use exponential backoff delays between retries
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.3 Enhance fetchWithAuth with concurrent request handling
    - Add module-scoped `refreshPromise` variable
    - Modify 401 handling to check if refresh is already in progress
    - Reuse existing refresh promise instead of creating duplicate requests
    - Reset `refreshPromise` to null after completion
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 1.4 Write unit tests for token lifecycle logging
    - Test that logging only occurs in development mode
    - Test that all lifecycle events are logged correctly
    - Mock console.log to verify calls
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 1.5 Write unit tests for retry logic
    - Test retry on network error (up to 2 times)
    - Test retry on 5xx server error
    - Test NO retry on 401 response
    - Test exponential backoff delays (1s, 2s)
    - Test token clearing on final failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 1.6 Write unit tests for concurrent request handling
    - Test that multiple 401s trigger only one refresh call
    - Test that all requests wait for the same refresh promise
    - Test that all requests retry after successful refresh
    - Test that all requests fail after failed refresh
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 2. Implement changePassword method in auth facade
  - [x] 2.1 Add ChangePasswordInput type definition
    - Create interface with `senhaAntiga: string` and `novaSenha: string`
    - Export type from authFacade.ts
    - _Requirements: 13.1, 13.4_

  - [x] 2.2 Implement changePassword method
    - Accept `senhaAntiga` and `novaSenha` as separate parameters
    - Call POST `/auth/change-password` via fetchWithAuth
    - Return `Promise<void>` (204 No Content response)
    - Handle 401 (incorrect password), 422 (validation error), and network errors
    - _Requirements: 3.6, 13.2, 13.3_

  - [ ]* 2.3 Write unit tests for changePassword method
    - Test successful password change (204 response)
    - Test 401 response (incorrect current password)
    - Test 422 response (validation error)
    - Test network error handling
    - Test that fetchWithAuth is called with correct parameters
    - _Requirements: 3.6, 4.6, 4.8, 4.9_

- [x] 3. Checkpoint - Verify auth facade enhancements
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create useChangePassword hook
  - [x] 4.1 Implement useChangePassword hook with TanStack Query
    - Create file at `src/hooks/auth/useChangePassword.ts`
    - Use `useMutation` to call `authFacade.changePassword()`
    - Accept `UseChangePasswordParams` with `senhaAntiga` and `novaSenha`
    - Show success toast on success using `sonner`
    - Do NOT show error toast on failure (dialog handles errors)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 4.2 Write unit tests for useChangePassword hook
    - Test that mutation calls authFacade.changePassword with correct params
    - Test that success toast is displayed on success
    - Test that no error toast is displayed on failure
    - Test mutation state (isPending, isError, isSuccess)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 5. Add i18n translations for change password feature
  - [x] 5.1 Add English translations to auth.json
    - Add `changePassword` section with all required keys
    - Include menuItem, title, labels, placeholders, buttons, success message, and error messages
    - _Requirements: 4.10_

  - [x] 5.2 Add Portuguese (pt-BR) translations to auth.json
    - Add `changePassword` section with all required keys
    - Translate all strings to Portuguese
    - _Requirements: 4.10_

- [x] 6. Implement ChangePasswordDialog component
  - [x] 6.1 Create ChangePasswordDialog component structure
    - Create file at `src/components/molecules/ChangePasswordDialog.tsx`
    - Define `ChangePasswordDialogProps` interface (open, onClose, data-testid)
    - Set up form state with three fields: senhaAntiga, novaSenha, confirmarSenha
    - Render modal with form fields using existing Modal component
    - _Requirements: 4.3_

  - [x] 6.2 Implement client-side validation
    - Validate novaSenha is at least 8 characters
    - Validate confirmarSenha matches novaSenha
    - Validate all fields are required
    - Run validation on submit and on blur for touched fields
    - _Requirements: 4.4, 4.5_

  - [x] 6.3 Implement form submission and error handling
    - Call useChangePassword hook on form submit
    - Handle 401 error: display "Current password is incorrect" below senhaAntiga field
    - Handle 422 error: display API validation message inline on relevant field
    - Handle network error: display network error message
    - _Requirements: 4.6, 4.8, 4.9, 7.3_

  - [x] 6.4 Implement success flow
    - Display success message when mutation succeeds
    - Wait 2 seconds after success
    - Call onClose() to close dialog
    - _Requirements: 4.7_

  - [x] 6.5 Implement accessibility features
    - Set tab order: Current Password → New Password → Confirm → Cancel → Submit
    - Add `aria-invalid="true"` on fields with errors
    - Link error messages to inputs via `aria-describedby`
    - Set `aria-busy="true"` on submit button while pending
    - Implement focus trap within modal
    - Auto-focus "Current Password" field on open
    - Close dialog on Escape key press
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ]* 6.6 Write unit tests for ChangePasswordDialog
    - Test form renders with three password fields
    - Test validation: new password min 8 characters
    - Test validation: passwords must match
    - Test inline error display on 401 (incorrect password)
    - Test inline error display on 422 (validation error)
    - Test general error display on network error
    - Test success message display and auto-close after 2s
    - Test Escape key closes dialog
    - Test Cancel button closes dialog
    - Test all inputs disabled while submitting
    - Test aria-busy on submit button while pending
    - Test aria-invalid on fields with errors
    - Test aria-describedby links errors to inputs
    - Test auto-focus on Current Password field
    - Test tab order
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ]* 6.7 Run accessibility tests with jest-axe
    - Test no axe violations when dialog is open
    - Test no axe violations with errors displayed
    - Test no axe violations in success state
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 7. Checkpoint - Verify change password dialog
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Integrate change password dialog into AdminShell
  - [x] 8.1 Add change password state and dialog to AdminShell
    - Import ChangePasswordDialog component
    - Add `isChangePasswordOpen` state
    - Render ChangePasswordDialog with open/onClose props
    - _Requirements: 4.1, 4.2_

  - [x] 8.2 Add "Change Password" menu item to user dropdown
    - Add menu item to user profile dropdown in SidebarNav
    - Set onClick handler to open change password dialog
    - Use i18n key `auth:changePassword.menuItem`
    - _Requirements: 4.1, 4.2_

- [x] 9. Add MSW mock handler for change password endpoint
  - [x] 9.1 Implement POST /auth/change-password mock handler
    - Add handler to `src/msw/authHandlers.ts`
    - Simulate realistic latency (200-500ms)
    - Check for valid Authorization header (return 401 if missing)
    - Return 204 on valid input
    - Return 401 on incorrect senhaAntiga
    - Return 422 on novaSenha shorter than 8 characters
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 9.2 Write tests for MSW change password handler
    - Test 204 response on valid input
    - Test 401 response on incorrect current password
    - Test 422 response on short new password
    - Test 401 response on missing Authorization header
    - Test latency simulation
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 10. Final integration testing
  - [ ]* 10.1 Write integration test for full change password flow
    - Test: open dialog → fill form → submit → success toast → dialog closes
    - Test: submit with incorrect password → error displayed → dialog stays open
    - Test: submit with short password → inline error → dialog stays open
    - Test: submit with mismatched passwords → inline error → dialog stays open
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 10.2 Write integration test for token refresh flow
    - Test: 401 response → refresh triggered → original request retried → success
    - Test: 401 response → refresh fails → tokens cleared → error thrown
    - Test: multiple concurrent 401s → single refresh call → all requests retry
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4, 9.5_

- [-] 11. Final checkpoint - Verify all functionality
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation uses TypeScript throughout
- Testing uses Vitest with React Testing Library and jest-axe
- MSW handlers enable development without backend dependency
- All UI components follow WCAG 2.1 AA accessibility standards
- i18n translations support both English and Portuguese (pt-BR)
