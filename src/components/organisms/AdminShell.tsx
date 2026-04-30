"use client";

import { useState, useCallback, type ReactNode } from "react";

import { SidebarNav } from "@/components/organisms/SidebarNav";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { NAV_ITEMS } from "@/config/nav";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/auth/useLogout";
import { UserRole } from "@/models";

export interface AdminShellProps {
  children?: ReactNode;
  defaultCollapsed?: boolean;
}

export function AdminShell({ children, defaultCollapsed = false }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();

  const handleToggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      document.cookie = `sidebar_collapsed=${next}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  }, []);

  const handleLogout = useCallback(() => logout(), [logout]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <SidebarNav
        items={NAV_ITEMS}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        userName={user?.nome ?? "User"}
        userRole={user?.role ?? UserRole.DISPATCHER}
        userAvatarUrl={null}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6">
          <h1 className="text-sm font-semibold text-neutral-900">GovMobile Admin</h1>
          <LanguageSwitcher />
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
