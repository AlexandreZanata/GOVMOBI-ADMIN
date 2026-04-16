/**
 * Filter value for active/inactive/all filtering.
 *
 * - `"all"` — returns every item regardless of `ativo` status
 * - `"active"` — returns only items where `ativo === true`
 * - `"inactive"` — returns only items where `ativo === false`
 */
export type AtivoFilter = "all" | "active" | "inactive";

/**
 * Filters a list of entities by their `ativo` field.
 *
 * This is a reusable generic utility shared across all domain page clients
 * (Cargos, Lotações, Servidores, Motoristas, etc.) to avoid duplicating
 * the same filtering logic.
 *
 * @param items - The array of entities to filter. Each entity must have an `ativo` boolean field.
 * @param filter - The filter to apply: `"all"`, `"active"`, or `"inactive"`.
 * @returns A filtered array based on the selected filter value.
 */
export function filterByAtivo<T extends { ativo: boolean }>(
  items: T[],
  filter: AtivoFilter,
): T[] {
  if (filter === "active") return items.filter((item) => item.ativo);
  if (filter === "inactive") return items.filter((item) => !item.ativo);
  return items;
}
