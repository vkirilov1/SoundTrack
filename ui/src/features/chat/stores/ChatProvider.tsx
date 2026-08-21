import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Client } from "@stomp/stompjs";
import { useAuth } from "../../auth/stores/useAuth";
import { ApiError } from "../../../lib/api-error";
import * as chatApi from "../api/chatApi";
import { connectChatSocket, sendChatMessage } from "../lib/chatSocket";
import type {
  ChatMessage,
  ChatRoomEvent,
  ChatRoomInfo,
  ChatUserSummary,
  CreateRoomPayload,
  JoinOutcome,
} from "../types";
import { ChatContext, type ChatPhase } from "./ChatContext";

const PENDING_POLL_MS = 4000;

/**
 * Global state for the docked chat panel: which room the user is in (at most one), its live
 * message stream and membership, and the waiting-for-approval flow. Mounted once inside
 * AuthProvider so the chat survives page navigation.
 */
function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [phase, setPhase] = useState<ChatPhase>({ kind: "idle" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [expanded, setExpandedState] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  const clientRef = useRef<Client | null>(null);
  const expandedRef = useRef(expanded);
  const userIdRef = useRef<number | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user]);

  const [lastUser, setLastUser] = useState(user);
  if (user !== lastUser) {
    setLastUser(user);
    if (!user) {
      setPhase({ kind: "idle" });
      setMessages([]);
    }
  }

  const activeRoomId = phase.kind === "active" ? phase.room.id : null;

  function setExpanded(value: boolean) {
    expandedRef.current = value;
    setExpandedState(value);
    if (value) setUnseenCount(0);
  }

  const enterRoom = useCallback((room: ChatRoomInfo) => {
    setMessages([]);
    setUnseenCount(0);
    setPhase({ kind: "active", room });
    setExpandedState(true);
    expandedRef.current = true;
  }, []);

  // Restore the dock on load/login: the backend knows which room (if any) the user is in
  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    chatApi
      .getMyRoom()
      .then((room) => {
        if (!cancelled) enterRoom(room);
      })
      .catch(() => {
        // 404 - not in a room
      });

    return () => {
      cancelled = true;
    };
  }, [user, enterRoom]);

  // Live connection for the active room
  useEffect(() => {
    if (activeRoomId == null) return;
    // Guards against a message for the OLD room arriving after switching to a new one (e.g. a
    // stale ROOM_CLOSED delivered late) from being applied to the new room's state.
    let stale = false;

    const handleMessage = (message: ChatMessage) => {
      if (stale) return;

      setMessages((prev) =>
        prev.some((m) => m.id === message.id) ? prev : [...prev, message],
      );

      if (!expandedRef.current && message.messageType === "TEXT") {
        setUnseenCount((prev) => prev + 1);
      }

      if (
        message.messageType === "KICK" &&
        message.senderId === userIdRef.current
      ) {
        setPhase((prev) =>
          prev.kind === "active"
            ? { kind: "ended", roomName: prev.room.name, reason: "kicked" }
            : prev,
        );
        return;
      }

      setPhase((prev) => {
        if (prev.kind !== "active") return prev;
        const summary: ChatUserSummary = {
          id: message.senderId,
          username: message.senderUsername,
          profilePicture: message.senderProfilePicture,
        };

        if (message.messageType === "JOIN") {
          if (prev.room.members.some((m) => m.id === summary.id)) return prev;
          const members = [...prev.room.members, summary];
          return {
            kind: "active",
            room: { ...prev.room, members, memberCount: members.length },
          };
        }

        if (message.messageType === "LEAVE" || message.messageType === "KICK") {
          const members = prev.room.members.filter((m) => m.id !== summary.id);
          if (members.length === prev.room.members.length) return prev;
          return {
            kind: "active",
            room: { ...prev.room, members, memberCount: members.length },
          };
        }

        return prev;
      });
    };

    const handleEvent = (event: ChatRoomEvent) => {
      if (stale) return;

      if (event.type === "ROOM_CLOSED") {
        setPhase((prev) => {
          if (prev.kind !== "active") return prev;
          // The owner triggered the close themselves - no notice needed for them
          if (prev.room.creator.id === userIdRef.current) {
            return { kind: "idle" };
          }
          return {
            kind: "ended",
            roomName: prev.room.name,
            reason: "closed",
          };
        });
        return;
      }

      if (event.type === "JOIN_REQUEST" && event.user) {
        const requester = event.user;
        setPhase((prev) => {
          if (
            prev.kind !== "active" ||
            prev.room.creator.id !== userIdRef.current ||
            prev.room.pendingRequests.some((r) => r.id === requester.id)
          ) {
            return prev;
          }
          return {
            kind: "active",
            room: {
              ...prev.room,
              pendingRequests: [...prev.room.pendingRequests, requester],
            },
          };
        });
        return;
      }

      if (event.type === "REQUEST_HANDLED" && event.userId != null) {
        setPhase((prev) => {
          if (prev.kind !== "active") return prev;
          return {
            kind: "active",
            room: {
              ...prev.room,
              pendingRequests: prev.room.pendingRequests.filter(
                (r) => r.id !== event.userId,
              ),
            },
          };
        });
      }
    };

    const client = connectChatSocket(activeRoomId, {
      onMessage: handleMessage,
      onEvent: handleEvent,
      onConnectedChange: setConnected,
    });
    clientRef.current = client;

    chatApi
      .getMessages(activeRoomId)
      .then((page) => {
        if (stale) return;
        const history = [...page.content].reverse();
        setMessages((prev) => {
          const known = new Set(history.map((m) => m.id));
          return [...history, ...prev.filter((m) => !known.has(m.id))];
        });
      })
      .catch(() => {});

    return () => {
      stale = true;
      clientRef.current = null;
      client.deactivate();
      setConnected(false);
    };
  }, [activeRoomId]);

  // While waiting for approval, poll until the owner acts
  useEffect(() => {
    if (phase.kind !== "pending") return;
    const roomId = phase.room.id;

    const interval = setInterval(() => {
      chatApi
        .getRoom(roomId)
        .then((room) => {
          if (room.myStatus === "MEMBER" || room.myStatus === "OWNER") {
            enterRoom(room);
          } else if (room.myStatus === "NONE") {
            setPhase({
              kind: "ended",
              roomName: room.name,
              reason: "declined",
            });
          }
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 404) {
            setPhase((prev) =>
              prev.kind === "pending"
                ? {
                    kind: "ended",
                    roomName: prev.room.name,
                    reason: "closed",
                  }
                : prev,
            );
          }
        });
    }, PENDING_POLL_MS);

    return () => clearInterval(interval);
  }, [phase, enterRoom]);

  const joinRoom = useCallback(
    async (roomId: number, leaveCurrent = false): Promise<JoinOutcome> => {
      if (phase.kind === "active" && phase.room.id === roomId) {
        setExpanded(true);
        return "joined";
      }

      if (
        (phase.kind === "active" || phase.kind === "pending") &&
        phase.room.id !== roomId
      ) {
        if (!leaveCurrent) return "conflict";
        if (phase.kind === "active") {
          await chatApi.leaveRoom(phase.room.id).catch(() => {});
        } else if (userIdRef.current != null) {
          await chatApi
            .declineRequest(phase.room.id, userIdRef.current)
            .catch(() => {});
        }
        setPhase({ kind: "idle" });
        setMessages([]);
      }

      try {
        const result = await chatApi.joinRoom(roomId);
        if (result.status === "REQUESTED") {
          setPhase({ kind: "pending", room: result.room });
          setExpandedState(true);
          expandedRef.current = true;
          return "requested";
        }
        enterRoom(result.room);
        return "joined";
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) return "gone";
          if (error.status === 403) return "forbidden";
          if (error.status === 409) {
            return error.message.toLowerCase().includes("capacity")
              ? "full"
              : "conflict";
          }
        }
        return "error";
      }
    },
    [phase, enterRoom],
  );

  const createRoom = useCallback(
    async (payload: CreateRoomPayload) => {
      const room = await chatApi.createRoom(payload);
      enterRoom(room);
    },
    [enterRoom],
  );

  const leave = useCallback(async () => {
    if (phase.kind === "active") {
      await chatApi.leaveRoom(phase.room.id).catch(() => {});
    }
    setPhase({ kind: "idle" });
    setMessages([]);
  }, [phase]);

  const cancelPending = useCallback(async () => {
    if (phase.kind === "pending" && userIdRef.current != null) {
      await chatApi
        .declineRequest(phase.room.id, userIdRef.current)
        .catch(() => {});
    }
    setPhase({ kind: "idle" });
  }, [phase]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || activeRoomId == null || !clientRef.current) return;
      sendChatMessage(clientRef.current, activeRoomId, trimmed);
    },
    [activeRoomId],
  );

  const kick = useCallback(
    async (userId: number) => {
      if (activeRoomId == null) return;
      await chatApi.kickMember(activeRoomId, userId);
    },
    [activeRoomId],
  );

  const approve = useCallback(
    async (userId: number) => {
      if (activeRoomId == null) return;
      await chatApi.approveRequest(activeRoomId, userId);
    },
    [activeRoomId],
  );

  const decline = useCallback(
    async (userId: number) => {
      if (activeRoomId == null) return;
      await chatApi.declineRequest(activeRoomId, userId);
    },
    [activeRoomId],
  );

  const invite = useCallback(
    async (userId: number) => {
      if (activeRoomId == null) return;
      await chatApi.inviteUser(activeRoomId, userId);
    },
    [activeRoomId],
  );

  const dismissEnded = useCallback(() => {
    setPhase((prev) => (prev.kind === "ended" ? { kind: "idle" } : prev));
  }, []);

  const room =
    phase.kind === "active" || phase.kind === "pending" ? phase.room : null;

  return (
    <ChatContext.Provider
      value={{
        phase,
        room,
        messages,
        connected,
        expanded,
        unseenCount,
        setExpanded,
        joinRoom,
        createRoom,
        leave,
        cancelPending,
        sendMessage,
        kick,
        approve,
        decline,
        invite,
        dismissEnded,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatProvider;
