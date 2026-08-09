import { useEffect, useState } from "react";
import { useAuth } from "../../auth/stores/useAuth";
import { refreshSession } from "../../../lib/api-client";
import {
  clearNotifications,
  getNotifications,
  getUnreadCount,
} from "../api/notificationApi";
import type { AppNotification } from "../types";

const RECONNECT_DELAY_MS = 3000;

/**
 * Seeds the unread badge once on login (in case notifications piled up before this tab opened),
 * then keeps it live over an SSE stream for the rest of the session - no polling. The full list is
 * only fetched on demand (when the bell dropdown opens), which also marks everything read.
 */
export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user || user.role === "ADMIN") return;

    let cancelled = false;
    let source: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (cancelled) return;

      source = new EventSource("/api/notifications/stream", {
        withCredentials: true,
      });

      source.addEventListener("notification", (event) => {
        const notification = JSON.parse(
          (event as MessageEvent<string>).data,
        ) as AppNotification;
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // EventSource's built-in auto-reconnect blindly retries with whatever cookie it already
      // has - after expiration -> refresh the session first, then open a fresh stream.
      source.onerror = () => {
        source?.close();
        if (cancelled) return;

        reconnectTimeout = setTimeout(() => {
          if (cancelled) return;
          refreshSession().finally(connect);
        }, RECONNECT_DELAY_MS);
      };
    }

    getUnreadCount()
      .then((count) => {
        if (!cancelled) setUnreadCount(count);
      })
      .catch(() => {});

    connect();

    return () => {
      cancelled = true;
      source?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [user]);

  function loadNotifications() {
    return getNotifications().then((res) => {
      setNotifications(res.content);
      setUnreadCount(0);
    });
  }

  function clearAll() {
    return clearNotifications().then(() => setNotifications([]));
  }

  return { unreadCount, notifications, loadNotifications, clearAll };
}
