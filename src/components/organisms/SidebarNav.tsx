"use client";

import {
  Briefcase,
  Building2,
  Car,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  ScrollText,
  Truck,
  UserCheck,
  UserRound,
  Users,
  ChevronLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Can } from "@/components/auth/Can";
import { NavItem } from "@/components/molecules/NavItem";
import { UserMenu } from "@/components/molecules/UserMenu";
import type { NavItemConfig } from "@/config/nav";
import { UserRole } from "@/models";

/** Map of icon name strings to Lucide components. */
const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardList,
  Briefcase,
  MapPin,
  UserCheck,
  Car,
  Truck,
  Users,
  Building2,
  ScrollText,
  LayoutDashboard,
  UserRound,
};

export interface SidebarNavProps {
  /** Ordered nav item config array. */
  items: NavItemConfig[];
  /** Whether the sidebar is in collapsed (icon-only) mode. */
  isCollapsed: boolean;
  /** Called when the collapse toggle is clicked. */
  onToggle: () => void;
  /** Authenticated user display name. */
  userName: string;
  /** Authenticated user role. */
  userRole: UserRole;
  /** Optional avatar URL. */
  userAvatarUrl?: string | null;
  /** Called when the user clicks the logout button. */
  onLogout?: () => void;
  /** Called when the user clicks the change password button. */
  onChangePassword?: () => void;
  /** Test selector. */
  "data-testid"?: string;
}

/**
 * Admin sidebar navigation with collapse toggle and user identity block.
 *
 * @param items - Ordered nav item config
 * @param isCollapsed - Collapsed state
 * @param onToggle - Toggle callback
 * @param userName - Authenticated user name
 * @param userRole - Authenticated user role
 * @param userAvatarUrl - Optional avatar URL
 * @param onLogout - Logout callback
 * @param onChangePassword - Change password callback
 * @param testId - Optional test selector
 * @returns Sidebar nav element
 */
export function SidebarNav({
  items,
  isCollapsed,
  onToggle,
  userName,
  userRole,
  userAvatarUrl,
  onLogout,
  onChangePassword,
  "data-testid": testId,
}: SidebarNavProps) {
  const { t } = useTranslation("nav");

  return (
    <aside
      data-testid={testId ?? "sidebar-nav"}
      className={[
        "flex h-full flex-col border-r border-neutral-200 bg-white",
        "transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-60",
      ].join(" ")}
    >
      {/* Logo / brand area */}
      <div
        className={[
          "flex h-14 shrink-0 items-center border-b border-neutral-200 px-3",
          isCollapsed ? "justify-center" : "gap-2",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-primary text-xs font-bold text-white"
        >
          G
        </span>
        <span
          className={[
            "overflow-hidden truncate text-sm font-semibold text-neutral-900",
            "transition-all duration-300 ease-in-out",
            isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
          ].join(" ")}
        >
          GovMobile
        </span>
      </div>

      {/* Navigation links */}
      <nav
        aria-label={t("mainNavigation")}
        className="flex-1 overflow-y-auto px-2 py-3"
      >
        <ul className="space-y-1" role="list">
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon];
            if (!Icon) return null;

            const link = (
              <NavItem
                key={item.href}
                href={item.href}
                label={t(item.labelKey)}
                icon={Icon}
                isCollapsed={isCollapsed}
              />
            );

            if (item.permission) {
              return (
                <li key={item.href}>
                  <Can perform={item.permission}>{link}</Can>
                </li>
              );
            }

            return <li key={item.href}>{link}</li>;
          })}
        </ul>
      </nav>

      {/* User identity block */}
      <div className="shrink-0 border-t border-neutral-200">
        <UserMenu
          name={userName}
          role={userRole}
          avatarUrl={userAvatarUrl}
          isCollapsed={isCollapsed}
          onLogout={onLogout}
          onChangePassword={onChangePassword}
        />
      </div>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-neutral-200 px-2 py-2">
        <button
          type="button"
          data-testid="sidebar-collapse-toggle"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? t("expand") : t("collapse")}
          onClick={onToggle}
          className={[
            "flex w-full items-center rounded-md px-3 py-2 text-sm",
            "text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
            isCollapsed ? "justify-center" : "gap-2",
          ].join(" ")}
        >
          <ChevronLeft
            aria-hidden="true"
            className={[
              "h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out",
              isCollapsed ? "rotate-180" : "rotate-0",
            ].join(" ")}
          />
          <span
            className={[
              "overflow-hidden truncate transition-all duration-300 ease-in-out",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            ].join(" ")}
          >
            {t("collapse")}
          </span>
        </button>
      </div>
    </aside>
  );
}
