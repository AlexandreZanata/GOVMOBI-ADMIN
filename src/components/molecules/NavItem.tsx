"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

export interface NavItemProps {
  /** Route href passed to next/link. */
  href: string;
  /** Translated label string. */
  label: string;
  /** Lucide icon component. */
  icon: LucideIcon;
  /** When true, only the icon is rendered (collapsed sidebar). */
  isCollapsed: boolean;
  /** Test selector. */
  "data-testid"?: string;
}

/**
 * Single admin sidebar navigation link.
 * Detects the active route via `usePathname` and applies `aria-current="page"`.
 * Eagerly prefetches the route on mount so navigation feels instant.
 *
 * @param href - Destination route
 * @param label - Translated display label
 * @param icon - Lucide icon component
 * @param isCollapsed - Collapsed sidebar mode (icon-only)
 * @param testId - Optional test selector
 * @returns Accessible nav link element
 */
export function NavItem({
  href,
  label,
  icon: Icon,
  isCollapsed,
  "data-testid": testId,
}: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  // Eagerly prefetch on mount so route JS is ready before the user clicks
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  return (
    <Link
      href={href}
      prefetch={true}
      data-testid={testId ?? `nav-item-${href.replace(/\//g, "-")}`}
      aria-current={isActive ? "page" : undefined}
      title={isCollapsed ? label : undefined}
      className={[
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand-primary focus-visible:ring-offset-1",
        isActive
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
        isCollapsed ? "justify-center" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        aria-hidden="true"
        className="h-5 w-5 shrink-0"
      />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
