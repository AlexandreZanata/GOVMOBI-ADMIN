"use client";

import { useState, useCallback, type ReactNode } from "react";

import { PermissionsProvider } from "@/components/auth/PermissionsProvider";
import { SidebarNav } from "@/components/organisms/SidebarNav";
import { NAV_ITEMS } from "@/config/nav";
import { UserRole } from "@/models";

export interface AdminShellProps {
  /** Page content rendered in the main area. */
  children?: ReactNode;
  /**
   * Initial collapsed state read from the server cookie.
   * Defaults to false (expanded).
   */
  defaultCollapsed?: boolean;
  /**
   * Authenticated user display name.
   * TODO: replace with session data once auth is wired.
   */
  userName?: string;
  /**
   * Authenticated user role.
   * TODO: replace with session data once auth is wired.
   */
  userRole?: UserRole;
  /** Optional avatar URL. */
  userAvatarUrl?: string | null;
}

/**
 * Root admin shell layout — sidebar + header + main content area.
 * Manages sidebar collapse state and persists it to a cookie.
 *
 * @param children - Page content
 * @param defaultCollapsed - Initial sidebar state from server cookie
 * @param userName - Authenticated user display name
 * @param userRole - Authenticated user role
 * @param userAvatarUrl - Optional avatar URL
 * @returns Full-height admin layout
 */
export function AdminShell({
  children,
  defaultCollapsed = false,
  userName = "Admin User",
  userRole = UserRole.ADMIN,
  userAvatarUrl = null,
}: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      // Persist to cookie so the server can read it on next request
      document.cookie = `sidebar_collapsed=${next}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  }, []);

  return (
    <PermissionsProvider role={userRole}>
      <div className="flex h-screen overflow-hidden bg-neutral-50">
        <SidebarNav
          items={NAV_ITEMS}
          isCollapsed={isCollapsed}
          onToggle={handleToggle}
          userName={userName}
          userRole={userRole}
          userAvatarUrl={userAvatarUrl}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top header bar */}
          <header className="flex h-14 shrink-0 items-center border-b border-neutral-200 bg-white px-6">
            <h1 className="text-sm font-semibold text-neutral-900">
              GovMobile Admin
            </h1>
          </header>

          {/* Main content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-6"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </PermissionsProvider>
  );
}
