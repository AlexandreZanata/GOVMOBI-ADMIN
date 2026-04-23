"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export interface MotoristaLocationData {
  motoristaId: string;
  lat: number;
  lng: number;
  endereco: string | null;
  velocidade: number | null;
  heading: number | null;
  status: "disponivel" | "ocupado";
  corridaId: string | null;
  ultimaAtualizacaoMs: number | null;
}

interface UseMotoristaLocationResult {
  data: MotoristaLocationData | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook that connects to the /despacho WebSocket and subscribes to
 * real-time position updates for a single motorista via
 * `buscar-posicao-motorista` / `posicao-motorista` events.
 *
 * Automatically disconnects when the component unmounts or `enabled` is false.
 */
export function useMotoristaLocation(
  motoristaId: string | undefined,
  enabled: boolean
): UseMotoristaLocationResult {
  const [data, setData] = useState<MotoristaLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !motoristaId) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    // Retrieve access token from sessionStorage (same key used by authFacade)
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("govmobile.access_token")
        : null;

    // Socket.io is at /socket.io (default path) on the backend.
    // /despacho is the namespace. We proxy /socket.io through Next.js rewrites
    // to avoid CORS, then connect to the /despacho namespace.
    const socket = io(`${window.location.origin}/despacho`, {
      path: "/socket.io",
      transports: ["polling"],
      auth: token ? { token } : undefined,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Request position with address resolution
      socket.emit("buscar-posicao-motorista", {
        motoristaId,
        comEndereco: true,
      });
    });

    socket.on(
      "posicao-motorista",
      (payload: { motoristaId: string; posicao: MotoristaLocationData | null }) => {
        setIsLoading(false);
        if (!payload.posicao) {
          setError("no_position");
          return;
        }
        setData(payload.posicao);
      }
    );

    socket.on("erro-posicoes", (payload: { mensagem: string }) => {
      setIsLoading(false);
      setError(payload.mensagem ?? "error");
    });

    socket.on("connect_error", (err) => {
      setIsLoading(false);
      setError(err.message ?? "connect_error");
    });

    socket.on("disconnect", () => {
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [motoristaId, enabled]);

  return { data, isLoading, error };
}
