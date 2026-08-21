import { Client } from "@stomp/stompjs";
import { refreshSession } from "../../../lib/api-client";
import type { ChatMessage, ChatRoomEvent } from "../types";

export interface ChatSocketCallbacks {
  onMessage: (message: ChatMessage) => void;
  onEvent: (event: ChatRoomEvent) => void;
  onConnectedChange: (connected: boolean) => void;
}

/**
 * Opens a STOMP connection for one room. Auth rides on the httpOnly access-token cookie sent with
 * the /ws handshake (the backend turns it into the STOMP session principal), so the cookie is
 * proactively refreshed before every (re)connect - a WebSocket can't run apiFetch's 401-retry.
 */
export function connectChatSocket(
  roomId: number,
  callbacks: ChatSocketCallbacks,
): Client {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  // SockJS endpoints expose the raw WebSocket transport under /websocket
  const url = `${protocol}://${window.location.host}/ws/websocket`;

  const client = new Client({
    webSocketFactory: () => new WebSocket(url),
    reconnectDelay: 3000,
    beforeConnect: async () => {
      await refreshSession();
    },
    onConnect: () => {
      client.subscribe(`/topic/chat/${roomId}`, (frame) => {
        callbacks.onMessage(JSON.parse(frame.body) as ChatMessage);
      });
      client.subscribe(`/topic/chat/${roomId}/events`, (frame) => {
        callbacks.onEvent(JSON.parse(frame.body) as ChatRoomEvent);
      });
      client.publish({ destination: `/app/chat/${roomId}/join` });
      callbacks.onConnectedChange(true);
    },
    onWebSocketClose: () => {
      callbacks.onConnectedChange(false);
    },
  });

  client.activate();
  return client;
}

export function sendChatMessage(
  client: Client,
  roomId: number,
  content: string,
) {
  client.publish({
    destination: `/app/chat/${roomId}/send`,
    body: JSON.stringify({ content }),
  });
}
