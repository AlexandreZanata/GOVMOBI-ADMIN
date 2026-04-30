/**
 * Resolves the base URL for API calls.
 *
 * In the browser, all requests go through the Next.js rewrite proxy
 * at `/api/proxy/*` to avoid CORS issues. On the server (SSR) and in
 * test environments, requests go directly to the backend URL so that
 * MSW handlers can intercept them reliably.
 *
 * @returns The base URL to prefix all API endpoint paths
 */
export function getApiBase(): string {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  // In test environments (Vitest/Jest) always use the direct backend URL
  // so MSW node-server handlers can intercept requests.
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return backendUrl;
  }

  if (typeof window !== "undefined") {
    // Browser — use the Next.js proxy to avoid CORS
    return "/api/proxy";
  }

  // Server-side (SSR) — call the backend directly
  return backendUrl;
}
