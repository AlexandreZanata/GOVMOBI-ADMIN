# Interaction Patterns — GOVMOBI-ADMIN

> **Cross-links:** [`design-pattern.md`](./design-pattern.md) · [`../product/use-cases.md`](../product/use-cases.md) · [`../design-system/design-system-accessibility.md`](../design-system/design-system-accessibility.md)

---

## 1. Confirmation Dialog

**Use for:** Any action that is destructive, irreversible, or has significant operational impact.

**Mandatory for:** Cancel run, override run status, deactivate user, change user role.

### Pattern

```tsx
// Trigger
<Button variant="destructive" onClick={() => setDialogOpen(true)}>
  {t("runs:actions.cancel")}
</Button>

// Dialog
<ConfirmDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  title={t("runs:cancel.title")}
  description={t("runs:cancel.description", { runTitle: run.title })}
  confirmLabel={t("runs:actions.confirmCancel")}
  confirmVariant="destructive"
  requireReason={true}
  reasonLabel={t("runs:cancel.reasonLabel")}
  onConfirm={(reason) => cancelRun({ id: run.id, reason })}
  isLoading={isCancelling}
/>
```

### Rules

- **Mandatory reason field** for: run cancellation, run override, user deactivation.
- Reason field must be validated (non-empty) before the confirm button is enabled.
- The confirm button uses `variant="destructive"` for irreversible actions.
- The cancel button uses `variant="ghost"`.
- Dialog title must name the specific action and entity (not generic "Are you sure?").
- `Escape` key closes the dialog without action.
- Focus returns to the trigger button on close.

### Permissions and Audit

- The dialog is only rendered inside a `<Can perform="...">` gate.
- On confirm, the mutation triggers the audit event server-side.
- The dialog must not be shown if the action is not available (use `<Can />` to hide the trigger).

---

## 2. Optimistic Updates

**Use for:** Mutations with high success rates where immediate feedback improves UX (run assignment, status transitions).

**Do not use for:** Destructive actions (cancel, deactivate) — these require confirmed server response.

### Pattern

```typescript
const { mutate: assignAgent } = useMutation({
  mutationFn: ({ runId, agentId }: AssignInput) =>
    runFacade.assign(runId, agentId),

  onMutate: async ({ runId, agentId }) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries({ queryKey: runKeys.detail(runId) });

    // Snapshot previous value
    const previous = queryClient.getQueryData(runKeys.detail(runId));

    // Optimistically update
    queryClient.setQueryData(runKeys.detail(runId), (old: Run) => ({
      ...old,
      status: RunStatus.ASSIGNED,
      agentId,
    }));

    return { previous };
  },

  onError: (error, { runId }, context) => {
    // Roll back on error
    queryClient.setQueryData(runKeys.detail(runId), context?.previous);
    toast.error(t("runs:errors.assignFailed"));
  },

  onSettled: (_, __, { runId }) => {
    // Always refetch to sync with server
    queryClient.invalidateQueries({ queryKey: runKeys.detail(runId) });
  },
});
```

### Rules

- Always roll back on error with a toast notification.
- Always invalidate the query on settle (success or error) to sync with server.
- Never use optimistic updates for actions that require server-side validation before proceeding.

---

## 3. Inline Editing

**Use for:** Simple field edits that do not require a full form (run notes, run title).

**Do not use for:** Complex multi-field edits, role changes, or any action requiring confirmation.

### Pattern

```tsx
function InlineEditField({ value, onSave }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span>{value}</span>
        <Can perform="run:edit">
          <button
            aria-label={t("common:edit")}
            onClick={() => setIsEditing(true)}
          >
            <EditIcon aria-hidden="true" />
          </button>
        </Can>
      </div>
    );
  }

  return (
    <form onSubmit={() => { onSave(draft); setIsEditing(false); }}>
      <Input value={draft} onChange={e => setDraft(e.target.value)} autoFocus />
      <Button type="submit" size="sm">{t("common:save")}</Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => { setDraft(value); setIsEditing(false); }}
      >
        {t("common:cancel")}
      </Button>
    </form>
  );
}
```

### Rules

- Always show explicit Save and Cancel buttons — never auto-save on blur.
- `autoFocus` the input when entering edit mode.
- `Escape` key cancels the edit (same as Cancel button).
- Unsaved changes are discarded on cancel — no confirmation needed for inline edits.

---

## 4. Bulk Actions

**Use for:** Operating on multiple runs simultaneously (bulk cancel, bulk reassign).

### Pattern

```tsx
// Selection state in Zustand store
const { selectedRunIds, toggleSelection, clearSelection } = useRunStore();

// Bulk action bar (appears when selection > 0)
{selectedRunIds.size > 0 && (
  <BulkActionBar
    count={selectedRunIds.size}
    actions={[
      <Can perform="run:cancel" key="cancel">
        <Button
          variant="destructive"
          onClick={() => setBulkCancelOpen(true)}
        >
          {t("runs:bulk.cancel", { count: selectedRunIds.size })}
        </Button>
      </Can>
    ]}
    onClearSelection={clearSelection}
  />
)}
```

### Rules

- Show the count of selected items in the confirmation dialog.
- Each item in a bulk action generates its own audit entry server-side.
- Partial failures (some items succeed, some fail) must be reported clearly.
- Clear selection after bulk action completes (success or failure).

---

## 5. Error Recovery

**Use for:** Any failed mutation or failed data fetch.

### Toast Pattern (for mutations)

```typescript
const { mutate } = useMutation({
  mutationFn: runFacade.cancel,
  onSuccess: () => {
    toast.success(t("runs:cancel.success"));
    queryClient.invalidateQueries({ queryKey: runKeys.all });
  },
  onError: (error: ApiError) => {
    toast.error(
      error.code === "FORBIDDEN"
        ? t("common:errors.forbidden")
        : t("runs:cancel.error")
    );
  },
});
```

### Error State Pattern (for queries)

```tsx
if (isError) {
  return (
    <ErrorState
      title={t("common:errors.loadFailed")}
      description={t("common:errors.tryAgain")}
      action={
        <Button variant="secondary" onClick={() => refetch()}>
          {t("common:retry")}
        </Button>
      }
    />
  );
}
```

### Rules

- Every mutation must have `onError` with a user-facing toast.
- Every query error must render an `<ErrorState />` with a retry action.
- Error messages must be actionable — tell the user what to do, not just what failed.
- `403 FORBIDDEN` errors must show a permission-specific message, not a generic error.

---

## Review Checklist

- [ ] All five patterns have implementation examples
- [ ] Confirmation dialog rules include mandatory reason field cases
- [ ] Optimistic update pattern includes rollback
- [ ] Bulk action pattern includes partial failure handling
- [ ] Error recovery covers both mutations (toast) and queries (error state)
- [ ] Permission and audit implications are noted per pattern
