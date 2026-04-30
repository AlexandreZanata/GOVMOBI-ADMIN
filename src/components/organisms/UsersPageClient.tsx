"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, Badge, Button } from "@/components/atoms";
import { Can } from "@/components/auth/Can";
import { ErrorState } from "@/components/molecules/ErrorState";
import { UserFormDialog } from "@/components/molecules/UserFormDialog";
import { useDeactivateUser } from "@/hooks/users/useDeactivateUser";
import { useUsers } from "@/hooks/users/useUsers";
import { Permission, type User, UserRole, UserStatus } from "@/models";

/** Role filter value — "ALL" means no filter applied. */
type RoleFilter = UserRole | "ALL";

/** Status filter value. */
type StatusFilter = "ALL" | "active" | "inactive";

/**
 * Props for the users page client organism.
 */
export interface UsersPageClientProps {
  /** Optional test selector assigned to the root section. */
  "data-testid"?: string;
}

/** Maps UserRole to a Badge variant. */
const roleBadgeVariant: Record<UserRole, "info" | "warning" | "success" | "neutral" | "danger"> = {
  [UserRole.ADMIN]: "danger",
  [UserRole.SUPERVISOR]: "warning",
  [UserRole.DISPATCHER]: "info",
  [UserRole.AGENT]: "neutral",
};

/** Maps UserStatus to a Badge variant. */
const statusBadgeVariant: Record<UserStatus, "success" | "neutral" | "info"> = {
  [UserStatus.ACTIVE]: "success",
  [UserStatus.INACTIVE]: "neutral",
  [UserStatus.ON_MISSION]: "info",
};

/**
 * Client-side users page renderer with query state handling, filtering, and CRUD dialogs.
 *
 * @param props - Optional root test selector
 * @returns Interactive users management content
 */
export function UsersPageClient({
  "data-testid": testId,
}: UsersPageClientProps) {
  const { t } = useTranslation("users");

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | undefined>();
  const [deactivateTarget, setDeactivateTarget] = useState<User | undefined>();

  const apiFilters = useMemo(
    () => ({
      ...(roleFilter !== "ALL" && { role: roleFilter as User["role"] }),
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    }),
    [roleFilter, statusFilter]
  );

  const { data, isLoading, isError, refetch } = useUsers(apiFilters);
  const items = data?.items ?? [];

  const handleOpenCreate = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditTarget(user);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditTarget(undefined);
  };

  let content: ReactNode;

  if (isLoading) {
    content = (
      <section data-testid="users-loading" className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-md bg-neutral-200"
          />
        ))}
      </section>
    );
  } else if (isError) {
    content = (
      <ErrorState
        data-testid="users-error"
        onRetry={() => void refetch()}
      />
    );
  } else if (!items.length) {
    content = (
      <section
        data-testid="users-empty"
        className="rounded-md border border-neutral-200 bg-neutral-50 p-6"
      >
        <h2 className="text-base font-semibold text-neutral-900">
          {t("page.empty.title")}
        </h2>
        <p className="mt-1 text-sm text-neutral-700">
          {t("page.empty.message")}
        </p>
      </section>
    );
  } else {
    content = (
      <div
        data-testid={testId ?? "users-table"}
        className="overflow-hidden rounded-md border border-neutral-200"
      >
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">{t("table.name")}</th>
              <th className="hidden px-4 py-3 md:table-cell">{t("table.email")}</th>
              <th className="px-4 py-3">{t("table.role")}</th>
              <th className="hidden px-4 py-3 lg:table-cell">{t("table.department")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {items.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={handleOpenEdit}
                onDeactivate={setDeactivateTarget}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Can
      perform={Permission.USER_VIEW}
      fallback={
        <section
          data-testid="users-access-denied"
          className="rounded-md border border-danger/30 bg-danger/10 p-4"
        >
          <p className="text-sm font-medium text-danger">
            {t("page.accessDenied")}
          </p>
        </section>
      }
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {t("page.title")}
            </h1>
            {data && (
              <p className="mt-0.5 text-sm text-neutral-500">
                {items.length} {items.length === 1 ? "user" : "users"}
              </p>
            )}
          </div>
          <Can perform={Permission.USER_CREATE}>
            <Button
              data-testid="users-create-btn"
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
            >
              {t("actions.create")}
            </Button>
          </Can>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            <span>{t("table.role")}</span>
            <select
              data-testid="users-filter-role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
            >
              <option value="ALL">{t("page.filters.allRoles")}</option>
              {Object.values(UserRole).map((r) => (
                <option key={r} value={r}>
                  {t(`role.${r}`)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            <span>{t("table.status")}</span>
            <select
              data-testid="users-filter-status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
            >
              <option value="ALL">{t("page.filters.allStatuses")}</option>
              <option value="active">{t("page.filters.active")}</option>
              <option value="inactive">{t("page.filters.inactive")}</option>
            </select>
          </label>
        </div>

        {content}
      </div>

      {/* Form dialog — create / edit */}
      <UserFormDialog
        data-testid="user-form-dialog"
        open={formOpen}
        onClose={handleCloseForm}
        mode={editTarget ? "edit" : "create"}
        user={editTarget}
      />

      {/* Deactivate confirmation dialog */}
      {deactivateTarget && (
        <UserDeactivateDialog
          user={deactivateTarget}
          onClose={() => setDeactivateTarget(undefined)}
        />
      )}
    </Can>
  );
}

// ── Row sub-component ────────────────────────────────────────────────────────

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
}

/**
 * Single table row for a user with edit and deactivate actions.
 *
 * @param props - User data and action callbacks
 * @returns Table row with permission-gated action buttons
 */
function UserRow({ user, onEdit, onDeactivate }: UserRowProps) {
  const { t } = useTranslation("users");
  const isInactive = user.status === UserStatus.INACTIVE;

  return (
    <tr
      data-testid={`user-row-${user.id}`}
      className="transition-colors hover:bg-neutral-50"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar
            data-testid={`user-avatar-${user.id}`}
            name={user.name}
            src={user.avatarUrl ?? undefined}
            size="sm"
          />
          <span className="font-medium text-neutral-900">{user.name}</span>
        </div>
      </td>

      <td className="hidden px-4 py-3 text-neutral-600 md:table-cell">
        {user.email}
      </td>

      <td className="px-4 py-3">
        <Badge
          data-testid={`user-role-${user.id}`}
          variant={roleBadgeVariant[user.role]}
        >
          {t(`role.${user.role}`)}
        </Badge>
      </td>

      <td className="hidden px-4 py-3 text-neutral-600 lg:table-cell">
        {user.departmentId}
      </td>

      <td className="px-4 py-3">
        <Badge
          data-testid={`user-status-${user.id}`}
          variant={statusBadgeVariant[user.status]}
        >
          {t(`status.${user.status}`)}
        </Badge>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Can perform={Permission.USER_EDIT}>
            <Button
              data-testid={`user-edit-${user.id}`}
              size="sm"
              variant="secondary"
              onClick={() => onEdit(user)}
            >
              {t("actions.edit")}
            </Button>
          </Can>

          {!isInactive && (
            <Can perform={Permission.USER_DEACTIVATE}>
              <Button
                data-testid={`user-deactivate-${user.id}`}
                size="sm"
                variant="destructive"
                onClick={() => onDeactivate(user)}
              >
                {t("actions.deactivate")}
              </Button>
            </Can>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Deactivate dialog sub-component ─────────────────────────────────────────

interface UserDeactivateDialogProps {
  user: User;
  onClose: () => void;
}

/**
 * Inline deactivation confirmation dialog.
 * Shows a warning if the user has active runs (affectedRunIds > 0).
 *
 * @param props - Target user and close callback
 * @returns Accessible destructive confirmation dialog
 */
function UserDeactivateDialog({ user, onClose }: UserDeactivateDialogProps) {
  const { t } = useTranslation("users");
  const deactivateMutation = useDeactivateUser();
  const dialogId = `deactivate-dialog-${user.id}`;

  const handleConfirm = async () => {
    await deactivateMutation.mutateAsync({ id: user.id }, { onSuccess: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      data-testid="user-deactivate-dialog"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogId}
        className="w-full max-w-md rounded-lg border border-neutral-300 bg-white p-5 shadow-sm"
      >
        <h2
          id={dialogId}
          className="text-base font-semibold text-neutral-900"
        >
          {t("deactivate.title")}
        </h2>

        <p className="mt-2 text-sm text-neutral-700">
          {t("deactivate.description")}
        </p>

        <p className="mt-1 text-sm font-medium text-neutral-900">{user.name}</p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button
            data-testid="user-deactivate-cancel"
            variant="ghost"
            onClick={onClose}
          >
            {t("deactivate.cancel")}
          </Button>
          <Button
            data-testid="user-deactivate-confirm"
            variant="destructive"
            onClick={() => void handleConfirm()}
            isLoading={deactivateMutation.isPending}
            disabled={deactivateMutation.isPending}
            autoFocus
          >
            {t("deactivate.confirm")}
          </Button>
        </div>
      </section>
    </div>
  );
}
