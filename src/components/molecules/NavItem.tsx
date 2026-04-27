"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";

export interface NavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  "data-testid"?: string;
}

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
        "flex h-10 w-full items-center text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-inset focus-visible:ring-brand-primary",
        isActive
          ? "bg-brand-primary/10 text-brand-primary"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
      ].join(" ")}
    >
      {/* Icon — always at the same x position regardless of collapsed state */}
      <div className="flex w-16 shrink-0 items-center justify-center">
        <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
      </div>

      {/* Label — fades and slides in/out */}
      <span
        className="whitespace-nowrap transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          opacity: isCollapsed ? 0 : 1,
          transform: isCollapsed ? "translateX(-8px)" : "translateX(0)",
          pointerEvents: isCollapsed ? "none" : "auto",
        }}
      >
        {label}
      </span>
    </Link>
  );
}
