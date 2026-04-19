import { ApiError, type ApiErrorPayload } from "@/types";

/**
 * Envelope shape used by the real GovMobile backend for all domain endpoints.
 * e.g. POST /cargos → { success: true, data: Cargo, timestamp: "..." }
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

/**
 * Parses a fetch response and throws a typed ApiError on failure.
 *
 * @param response - Fetch API response object
 * @returns Parsed JSON body typed as `T`
 * @throws ApiError when response status is not successful
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  const errorPayload = (await response
    .json()
    .catch(() => null)) as ApiErrorPayload | null;

  throw new ApiError(
    response.status,
    errorPayload?.code ?? "REQUEST_FAILED",
    errorPayload?.message ?? `HTTP ${response.status}: ${response.statusText}`
  );
}

/**
 * Parses a fetch response that uses the `{ success, data, timestamp }` envelope
 * and returns only the unwrapped `data` field.
 * Use this for all real GovMobile domain endpoints (cargos, lotacoes, servidores…).
 *
 * @param response - Fetch API response object
 * @returns The `data` field from the API envelope, typed as `T`
 * @throws ApiError when response status is not successful
 */
export async function handleEnvelopedResponse<T>(
  response: Response
): Promise<T> {
  const envelope = await handleApiResponse<ApiEnvelope<T>>(response);
  return envelope.data;
}
