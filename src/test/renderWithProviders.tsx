import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType, ReactNode } from "react";

/**
 * Shared wrapper component type for testing-library render utilities.
 */
interface TestWrapperProps {
  /** Rendered test element subtree. */
  children: ReactNode;
}

/**
 * Creates a React Testing Library wrapper with app-level providers.
 *
 * @returns A provider wrapper component and the underlying QueryClient instance
 */
export function renderWithProviders(): {
  wrapper: ComponentType<TestWrapperProps>;
  queryClient: QueryClient;
} {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: TestWrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return { wrapper: Wrapper, queryClient };
}
