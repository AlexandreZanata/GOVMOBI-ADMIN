/**
 * TanStack Query key factory for vehicle-related queries.
 */
export const veiculosKeys = {
  /** Root key for all vehicle queries. */
  all: ["veiculos"] as const,
  /** Key for the vehicle list query. */
  list: () => ["veiculos", "list"] as const,
  /** Key for a single vehicle detail query. */
  detail: (id: string) => ["veiculos", "detail", id] as const,
};
