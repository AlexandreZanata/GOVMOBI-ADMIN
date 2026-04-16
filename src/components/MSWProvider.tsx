"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Boots the MSW browser worker in development when NEXT_PUBLIC_MOCK_MODE=true.
 * Renders children only after the worker is ready to avoid race conditions
 * where the first fetch fires before MSW has registered its handlers.
 *
 * @param children - Application subtree
 * @returns Children, gated until MSW is ready (dev only)
 */
export function MSWProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_MOCK_MODE !== "true"
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_MODE !== "true") return;

    import("@/msw/browser")
      .then(({ worker }) =>
        worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: { url: "/mockServiceWorker.js" },
        })
      )
      .then(() => setReady(true))
      .catch(console.error);
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
