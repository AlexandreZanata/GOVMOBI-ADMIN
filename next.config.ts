import type { NextConfig } from "next";

/**
 * GovMobile Admin Panel — Next.js configuration.
 * App Router + strict mode + absolute imports from "@/".
 *
 * API calls are proxied through Next.js rewrites to avoid CORS issues
 * when the frontend (localhost:3000) calls the backend (172.19.2.116:3000).
 *
 * WebSocket (socket.io) is proxied through /api/ws API route which
 * forwards both HTTP polling and WebSocket upgrade to /despacho on the backend.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fix HMR WebSocket connecting to network IP instead of localhost
  // when running in a VM or container environment
  devIndicators: false,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";
    return {
      beforeFiles: [
        {
          source: "/api/proxy/:path*",
          destination: `${apiUrl}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
