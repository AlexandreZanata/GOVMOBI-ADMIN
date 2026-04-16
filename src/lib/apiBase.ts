/**
 * Resolves the base URL for API calls.
 *
 * In the browser, all requests go through the Next.js rewrite proxy
 * at `/api/proxy/*` to avoid CORS issues. On the server (SSR), requests
 * go directly to the backend URL.
 *
 * @returns The base URL to prefix all API endpoint paths
 */
export function getApiBase(): string {
  if (typeof window !== "undefined") {
    // Browser — use the Next.js proxy to avoid CORS
    return "/api/proxy";
  }
  // Server-side — call the backend directly
  return process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";
}
