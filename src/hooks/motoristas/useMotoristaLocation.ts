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
  isLive: boolean;
}

const REFRESH_INTERVAL_MS = 3000;

/**
 * Hook that connects to the /despacho WebSocket and polls for real-time
 * position updates every 3 seconds via buscar-posicao-motorista / posicao-motorista.
 *
 * The server responds to each emit with a single posicao-motorista event,
 * so we re-emit on an interval to keep the position fresh.
 */
export function useMotoristaLocation(
  motoristaId: string | undefined,
  enabled: boolean
): UseMotoristaLocationResult {
  const [data, setData] = useState<MotoristaLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !motoristaId) {
      setData(null);
      setError(null);
      setIsLive(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);
    setIsLive(false);

    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("govmobile.access_token")
        : null;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://172.19.2.116:3000";

    const socket = io(`${backendUrl}/despacho`, {
      transports: ["polling", "websocket"],
      auth: token ? { token } : undefined,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    const requestPosition = () => {
      if (socket.connected) {
        socket.emit("buscar-posicao-motorista", {
          motoristaId,
          comEndereco: true,
        });
      }
    };

    socket.on("connect", () => {
      setIsLive(true);
      requestPosition();
      // Poll every 3s to keep position fresh
      intervalRef.current = setInterval(requestPosition, REFRESH_INTERVAL_MS);
    });

    socket.on(
      "posicao-motorista",
      (payload: { motoristaId: string; posicao: MotoristaLocationData | null }) => {
        setIsLoading(false);
        if (!payload.posicao) {
          setError("no_position");
          return;
        }
        setError(null);
        setData(payload.posicao);
      }
    );

    socket.on("erro-posicoes", (payload: { mensagem: string }) => {
      setIsLoading(false);
      setError(payload.mensagem ?? "error");
    });

    socket.on("connect_error", (err) => {
      setIsLoading(false);
      setIsLive(false);
      setError(err.message ?? "connect_error");
    });

    socket.on("disconnect", () => {
      setIsLive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [motoristaId, enabled]);

  return { data, isLoading, error, isLive };
}
