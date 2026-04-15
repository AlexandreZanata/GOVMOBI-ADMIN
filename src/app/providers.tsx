"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/i18n/config";

/**
 * App-level client providers: TanStack Query + i18n initialisation.
 * Rendered once in the root layout, wrapping all pages.
 *
 * @param children - Application subtree
 * @returns Provider-wrapped subtree
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
