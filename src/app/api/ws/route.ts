/**
 * WebSocket proxy for the /despacho socket.io namespace.
 *
 * Next.js App Router does not natively support WebSocket upgrades in API routes.
 * This route handles the socket.io HTTP polling transport only.
 * WebSocket upgrade is handled by the custom server (server.ts).
 *
 * For polling transport, requests arrive as:
 *   GET/POST /api/ws?EIO=4&transport=polling&...
 * and are forwarded to:
 *   http://BACKEND/despacho/?EIO=4&transport=polling&...
 */

import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

async function proxyRequest(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const targetUrl = `${BACKEND}/despacho/${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Skip headers that would cause issues
    if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.arrayBuffer()
      : undefined;

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!["transfer-encoding", "connection"].includes(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req);
}
