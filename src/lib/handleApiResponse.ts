import { ApiError, type ApiErrorPayload } from "@/types";

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
    errorPayload?.message ?? "REQUEST_FAILED"
  );
}
