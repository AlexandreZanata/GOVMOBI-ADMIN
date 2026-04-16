"use client";

import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Avatar, Badge } from "@/components/atoms";
import { Button } from "@/components/atoms/Button";
import { UserRole } from "@/models";

export interface UserMenuProps {
  /** Full display name of the authenticated user. */
  name: string;
  /** Role used to render the role badge. */
  role: UserRole;
  /** Optional avatar image URL. */
  avatarUrl?: string | null;
  /** When true, only the avatar is rendered (collapsed sidebar). */
  isCollapsed: boolean;
  /** Called when the user clicks "Sign out". */
  onLogout?: () => void;
  /** Test selector. */
  "data-testid"?: string;
}

const roleBadgeVariant: Record<UserRole, "info" | "warning" | "success" | "neutral"> = {
  [UserRole.ADMIN]:      "danger" as never,
  [UserRole.SUPERVISOR]: "warning",
  [UserRole.DISPATCHER]: "info",
  [UserRole.AGENT]:      "neutral",
};

/**
 * Sidebar user identity block with avatar, role badge, and logout action.
 *
 * @param name - Authenticated user's display name
 * @param role - User role for badge rendering
 * @param avatarUrl - Optional profile image
 * @param isCollapsed - Collapsed sidebar mode (avatar-only)
 * @param onLogout - Logout callback
 * @param testId - Optional test selector
 * @returns User identity and logout UI
 */
export function UserMenu({
  name,
  role,
  avatarUrl,
  isCollapsed,
  onLogout,
  "data-testid": testId,
}: UserMenuProps) {
  const { t } = useTranslation("nav");

  return (
    <div
      data-testid={testId ?? "user-menu"}
      className={[
        "flex items-center gap-3 px-3 py-3",
        isCollapsed ? "justify-center" : "",
      ].join(" ")}
    >
      <Avatar
        name={name}
        src={avatarUrl ?? undefined}
        size="sm"
        data-testid="user-menu-avatar"
      />

      {!isCollapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
          <Badge
            variant={roleBadgeVariant[role]}
            data-testid="user-menu-role-badge"
          >
            {role}
          </Badge>
        </div>
      )}

      {!isCollapsed && (
        <Button
          variant="ghost"
          size="sm"
          data-testid="user-menu-logout"
          aria-label={t("logout")}
          onClick={onLogout}
          className="shrink-0 px-2"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}
