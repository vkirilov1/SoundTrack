import { useEffect, useState } from "react";
import { useAuth } from "../../auth/stores/useAuth";
import { useChat } from "../../chat/stores/useChat";
import { refreshSession } from "../../../lib/api-client";
import {
  clearNotifications,
  getNotifications,
  getUnreadCount,
} from "../api/notificationApi";
import { CHAT_NOTIFICATION_TYPES } from "../types";
import type { AppNotification } from "../types";

const RECONNECT_DELAY_MS = 3000;

/**
 * Seeds the unread badge once on login (in case notifications piled up before this tab opened),
 * then keeps it live over an SSE stream for the rest of the session
 */
export function useNotifications() {
  const { user } = useAuth();
  const { phase } = useChat();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Drop invite/approval notifications for a room once it's joined or requested.
  const relevantRoomId =
    phase.kind === "active" || phase.kind === "pending" ? phase.room.id : null;
  const [prunedRoomId, setPrunedRoomId] = useState<number | null>(null);
  if (relevantRoomId != null && relevantRoomId !== prunedRoomId) {
    setPrunedRoomId(relevantRoomId);
    setNotifications((prev) =>
      prev.filter(
        (n) =>
          !(
            CHAT_NOTIFICATION_TYPES.has(n.type) && n.entityId === relevantRoomId
          ),
      ),
    );
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

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
