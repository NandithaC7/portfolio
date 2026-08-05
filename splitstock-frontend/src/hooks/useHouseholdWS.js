import { useEffect, useRef, useState } from "react";

import { WS_URL } from "../api/client";
import { useAuthStore } from "../store/authStore";

/**
 * One WebSocket per household, authenticated with the same JWT the REST API
 * uses (passed as a query param — browsers can't set handshake headers).
 *
 * Reconnects with backoff, and keeps the latest handler in a ref so callers
 * don't have to memoise it to avoid tearing the socket down on every render.
 */
export default function useHouseholdWS(householdId, onMessage) {
  const [connected, setConnected] = useState(false);
  const handlerRef = useRef(onMessage);
  const socketRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);
  const closedByUs = useRef(false);

  handlerRef.current = onMessage;

  useEffect(() => {
    const token = useAuthStore.getState().tokens?.access;
    if (!householdId || !token) return undefined;

    closedByUs.current = false;

    const connect = () => {
      const socket = new WebSocket(
        `${WS_URL}/ws/households/${householdId}/?token=${token}`
      );
      socketRef.current = socket;

      socket.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          handlerRef.current?.(JSON.parse(event.data));
        } catch {
          // A malformed frame shouldn't take the connection down.
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (closedByUs.current) return;
        // Back off, but keep trying — a flatmate's log is worth reconnecting for.
        const delay = Math.min(15000, 800 * 2 ** retryRef.current);
        retryRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
      };

      socket.onerror = () => socket.close();
    };

    connect();

    return () => {
      closedByUs.current = true;
      clearTimeout(timerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [householdId]);

  return { connected };
}
