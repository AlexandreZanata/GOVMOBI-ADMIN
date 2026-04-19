import type { Servidor } from "@/models/Servidor";
import type { UpdateServidorInput } from "@/types/servidores";

/**
 * Compares the original servidor data with the edited form values and returns
 * a partial payload containing **only** the fields that actually changed.
 *
 * For the `papeis` array, a deep comparison is performed by sorting both
 * arrays and comparing element-by-element, so order differences are ignored.
 *
 * This keeps `PUT /servidores/{id}` requests minimal — unchanged fields are
 * omitted from the payload, satisfying Requirement 13.5.
 *
 * @param original - The current servidor record as fetched from the API.
 * @param edited - The form values the user submitted (only mutable fields).
 * @returns A partial update payload with only the changed fields.
 */
export function buildServidorUpdatePayload(
  original: Servidor,
  edited: UpdateServidorInput,
): Partial<UpdateServidorInput> {
  const payload: Partial<UpdateServidorInput> = {};

  if (edited.nome !== undefined && edited.nome !== original.nome) {
    payload.nome = edited.nome;
  }

  if (edited.telefone !== undefined && edited.telefone !== original.telefone) {
    payload.telefone = edited.telefone;
  }

  if (edited.cargoId !== undefined && edited.cargoId !== original.cargoId) {
    payload.cargoId = edited.cargoId;
  }

  if (
    edited.lotacaoId !== undefined &&
    edited.lotacaoId !== original.lotacaoId
  ) {
    payload.lotacaoId = edited.lotacaoId;
  }

  if (edited.papeis !== undefined && !arePapeisEqual(original.papeis, edited.papeis)) {
    payload.papeis = edited.papeis;
  }

  return payload;
}

/**
 * Deep-compares two `Papel[]` arrays by sorting copies and checking
 * element-by-element equality. Order-insensitive.
 *
 * @param a - First papeis array.
 * @param b - Second papeis array.
 * @returns `true` when both arrays contain the same elements.
 */
function arePapeisEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}
