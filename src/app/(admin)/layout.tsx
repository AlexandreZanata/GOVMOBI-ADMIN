import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/organisms/AdminShell";
import { AuthGuard } from "@/components/organisms/AuthGuard";

/**
 * Admin route group layout.
 * Server Component — reads the sidebar collapse cookie and passes it to
 * the client shell so the initial render matches the user's last preference.
 * Wraps content with AuthGuard to verify authentication before rendering.
 *
 * @param children - Page content from the matched admin route
 * @returns Auth-guarded admin shell wrapping the page content
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("sidebar_collapsed")?.value === "true";

  return (
    <>
      {/* Skip-to-content — keyboard and screen-reader accessibility */}
      <a
        href="#main-content"
        className={[
          "sr-only focus:not-sr-only",
          "focus:fixed focus:left-2 focus:top-2 focus:z-50",
          "focus:rounded-md focus:bg-brand-primary",
          "focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white",
          "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2",
        ].join(" ")}
      >
        Skip to content
      </a>

      <AuthGuard>
        <AdminShell defaultCollapsed={defaultCollapsed}>
          {children}
        </AdminShell>
      </AuthGuard>
    </>
  );
}
