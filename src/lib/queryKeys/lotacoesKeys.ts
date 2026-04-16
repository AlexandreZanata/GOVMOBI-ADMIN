/**
 * Lotacao query key factory for TanStack Query caches.
 */
export const lotacoesKeys = {
  all: ["lotacoes"] as const,
  list: () => [...lotacoesKeys.all, "list"] as const,
  detail: (id: string) => [...lotacoesKeys.all, "detail", id] as const,
};
