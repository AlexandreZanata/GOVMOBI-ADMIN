/**
 * Custom Next.js server with WebSocket proxy support.
 *
 * Intercepts WebSocket upgrade requests to /api/ws and forwards them
 * to the backend's /despacho socket.io namespace, enabling real-time
 * driver location tracking without CORS issues.
 *
 * Usage: npx ts-node --project tsconfig.server.json server.ts
 * Or via: npm run dev (configured in package.json)
 */

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import httpProxy from "http-proxy";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.NEXT_PUBLIC_DEV_HOSTNAME ?? "localhost";
const port = parseInt(process.env.PORT ?? "3001", 10);
const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create a proxy instance for WebSocket upgrades
const proxy = httpProxy.createProxyServer({
  target: backendUrl,
  ws: true,
  changeOrigin: true,
});

proxy.on("error", (err, _req, res) => {
  console.error("[WS Proxy] Error:", err.message);
  if (res && "writeHead" in res) {
    (res as import("http").ServerResponse).writeHead(502);
    (res as import("http").ServerResponse).end("Bad Gateway");
  }
});

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "/", true);
    handle(req, res, parsedUrl);
  });

  // Intercept WebSocket upgrade requests to /api/ws
  // and forward them to the backend's /despacho namespace
  server.on("upgrade", (req, socket, head) => {
    const url = req.url ?? "";
    if (url.startsWith("/api/ws")) {
      // Rewrite path: /api/ws → /despacho
      req.url = url.replace(/^\/api\/ws/, "/despacho");
      proxy.ws(req, socket, head);
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
