import type { ListUsersInput } from "@/types/users";

/**
 * User query key factory for TanStack Query caches.
 */
export const usersKeys = {
  all: ["users"] as const,
  list: (filters?: ListUsersInput) =>
    [...usersKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};
