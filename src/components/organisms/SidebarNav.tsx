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
  PanelLeftClose,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import "@/i18n/config";

import { Can } from "@/components/auth/Can";
import { NavItem } from "@/components/molecules/NavItem";
import { UserMenu } from "@/components/molecules/UserMenu";
import type { NavItemConfig } from "@/config/nav";
import { UserRole } from "@/models";

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
  items: NavItemConfig[];
  isCollapsed: boolean;
  onToggle: () => void;
  userName: string;
  userRole: UserRole;
  userAvatarUrl?: string | null;
  onLogout?: () => void;
  onChangePassword?: () => void;
  "data-testid"?: string;
}

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
      style={{ width: isCollapsed ? "4rem" : "15rem" }}
      className="relative flex h-full shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
    >
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center border-b border-neutral-200">
        {/* Icon always at same x position */}
        <div className="flex w-16 shrink-0 items-center justify-center">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-primary text-xs font-bold text-white"
          >
            G
          </span>
        </div>
        {/* Label slides in */}
        <span
          className="whitespace-nowrap text-sm font-semibold text-neutral-900 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? "translateX(-8px)" : "translateX(0)",
            pointerEvents: isCollapsed ? "none" : "auto",
          }}
        >
          GovMobile
        </span>
      </div>

      {/* Nav links */}
      <nav aria-label={t("mainNavigation")} className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <ul className="space-y-0.5" role="list">
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

      {/* User menu */}
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
      <div className="shrink-0 border-t border-neutral-200">
        <button
          type="button"
          data-testid="sidebar-collapse-toggle"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? t("expand") : t("collapse")}
          onClick={onToggle}
          className="flex h-11 w-full items-center text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary"
        >
          {/* Icon — always at same x */}
          <div className="flex w-16 shrink-0 items-center justify-center">
            <PanelLeftClose
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>
          {/* Label */}
          <span
            className="whitespace-nowrap text-sm transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "translateX(-8px)" : "translateX(0)",
              pointerEvents: isCollapsed ? "none" : "auto",
            }}
          >
            {t("collapse")}
          </span>
        </button>
      </div>
    </aside>
  );
}
