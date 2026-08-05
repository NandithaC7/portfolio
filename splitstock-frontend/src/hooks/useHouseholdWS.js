import { useEffect, useRef, useState } from "react";

import { WS_URL } from "../api/client";
import { useAuthStore } from "../store/authStore";

// The consumer closes with these when the connection will never be allowed:
// a bad token, or a household this user isn't in. Retrying can't fix either.
const UNAUTHENTICATED = 4001;
const NOT_A_MEMBER = 4003;

/**
 * One WebSocket per household, authenticated with the same JWT the REST API
 * uses (passed as a query param — browsers can't set handshake headers).
 *
 * Reconnects with backoff on transport failures only, and keeps the latest
 * handler in a ref so callers don't have to memoise it to avoid tearing the
 * socket down on every render.
 */
export default function useHouseholdWS(householdId, onMessage) {
  const [connected, setConnected] = useState(false);
  const [rejected, setRejected] = useState(null);
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
    setRejected(null);

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

      socket.onclose = (event) => {
        setConnected(false);
        if (closedByUs.current) return;

        if (event.code === UNAUTHENTICATED || event.code === NOT_A_MEMBER) {
          setRejected(event.code);
          // A stale household id in persisted state self-heals here rather
          // than looping on a rejection that can never succeed.
          if (event.code === NOT_A_MEMBER) {
            useAuthStore.getState().loadHouseholds().catch(() => {});
          }
          return;
        }

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

  return { connected, rejected };
}
