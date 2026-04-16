import type { ReactNode } from "react";

/**
 * Auth route group layout — minimal centered layout without the admin shell.
 *
 * Used by `/login` and `/register` pages. Renders children in a centered
 * container with no sidebar or topbar.
 *
 * @param children - Page content from the matched auth route
 * @returns Centered layout for authentication pages
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
