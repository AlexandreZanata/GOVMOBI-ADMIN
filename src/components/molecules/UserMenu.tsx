"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import "@/i18n/config";

import { Avatar, Badge } from "@/components/atoms";
import { UserRole } from "@/models";

export interface UserMenuProps {
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
  isCollapsed: boolean;
  onLogout?: () => void;
  onChangePassword?: () => void;
  "data-testid"?: string;
}

const roleBadgeVariant: Record<UserRole, "info" | "warning" | "success" | "neutral"> = {
  [UserRole.ADMIN]:      "danger" as never,
  [UserRole.SUPERVISOR]: "warning",
  [UserRole.DISPATCHER]: "info",
  [UserRole.AGENT]:      "neutral",
};

export function UserMenu({
  name,
  role,
  avatarUrl,
  isCollapsed,
  onLogout,
  "data-testid": testId,
}: UserMenuProps) {
  const { t } = useTranslation(["nav"]);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <div ref={menuRef} data-testid={testId ?? "user-menu"} className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={[
          "flex w-full items-center gap-3 px-3 py-3 transition-colors hover:bg-neutral-50",
          isCollapsed ? "justify-center" : "",
        ].join(" ")}
      >
        <Avatar name={name} src={avatarUrl ?? undefined} size="sm" data-testid="user-menu-avatar" />

        {!isCollapsed && (
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
            <Badge variant={roleBadgeVariant[role]} data-testid="user-menu-role-badge">{role}</Badge>
          </div>
        )}

        {!isCollapsed && (
          <svg
            aria-hidden="true"
            className={["h-4 w-4 shrink-0 text-neutral-400 transition-transform", isMenuOpen ? "rotate-180" : ""].join(" ")}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {isMenuOpen && !isCollapsed && (
        <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="py-1">
            <button
              type="button"
              onClick={() => { setIsMenuOpen(false); router.push("/profile"); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" />
              <span>Perfil</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={() => { setIsMenuOpen(false); onLogout(); }}
                data-testid="user-menu-logout"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                </svg>
                <span>{t("nav:logout")}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
