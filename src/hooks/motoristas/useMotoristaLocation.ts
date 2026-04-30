"use client";

import { useEffect, useReducer, useRef } from "react";
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

interface LocationState {
  data: MotoristaLocationData | null;
  isLoading: boolean;
  error: string | null;
  isLive: boolean;
}

type LocationAction =
  | { type: "CONNECTING" }
  | { type: "CONNECTED" }
  | { type: "POSITION"; payload: MotoristaLocationData }
  | { type: "ERROR"; payload: string }
  | { type: "DISCONNECTED" }
  | { type: "RESET" };

const initialState: LocationState = {
  data: null,
  isLoading: false,
  error: null,
  isLive: false,
};

function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case "CONNECTING":
      return { data: null, isLoading: true, error: null, isLive: false };
    case "CONNECTED":
      return { ...state, isLive: true };
    case "POSITION":
      return { ...state, isLoading: false, error: null, data: action.payload };
    case "ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "DISCONNECTED":
      return { ...state, isLive: false };
    case "RESET":
      return initialState;
    default:
      return state;
  }
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
  const [state, dispatch] = useReducer(locationReducer, initialState);
  const socketRef = useRef<Socket | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !motoristaId) {
      dispatch({ type: "RESET" });
      return;
    }

    dispatch({ type: "CONNECTING" });

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
      dispatch({ type: "CONNECTED" });
      requestPosition();
      // Poll every 3s to keep position fresh
      intervalRef.current = setInterval(requestPosition, REFRESH_INTERVAL_MS);
    });

    socket.on(
      "posicao-motorista",
      (payload: { motoristaId: string; posicao: MotoristaLocationData | null }) => {
        if (!payload.posicao) {
          dispatch({ type: "ERROR", payload: "no_position" });
          return;
        }
        dispatch({ type: "POSITION", payload: payload.posicao });
      }
    );

    socket.on("erro-posicoes", (payload: { mensagem: string }) => {
      dispatch({ type: "ERROR", payload: payload.mensagem ?? "error" });
    });

    socket.on("connect_error", (err) => {
      dispatch({ type: "ERROR", payload: err.message ?? "connect_error" });
      dispatch({ type: "DISCONNECTED" });
    });

    socket.on("disconnect", () => {
      dispatch({ type: "DISCONNECTED" });
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

  return state;
}
