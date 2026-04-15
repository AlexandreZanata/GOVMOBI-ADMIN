/**
 * Motorista query key factory for TanStack Query caches.
 */
export const motoristasKeys = {
  all: ["motoristas"] as const,
  list: () => [...motoristasKeys.all, "list"] as const,
  detail: (id: string) => [...motoristasKeys.all, "detail", id] as const,
};
