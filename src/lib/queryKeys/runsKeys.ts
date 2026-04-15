/**
 * Run query key factory for TanStack Query caches.
 */
export const runsKeys = {
  all: ["runs"] as const,
  list: () => [...runsKeys.all, "list"] as const,
};
