import { useState } from "react";
import { useChat } from "../stores/useChat";
import type { ChatRoomInfo } from "../types";

/** Shared join-attempt + conflict/error handling for any list of `ChatRoomRow`s outside ChatsPage. */
export function useRoomJoinHandler() {
  const { joinRoom } = useChat();
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [conflictRoom, setConflictRoom] = useState<ChatRoomInfo | null>(null);

  async function attemptJoin(room: ChatRoomInfo, leaveCurrent = false) {
    setRowErrors((prev) => ({ ...prev, [room.id]: "" }));

    const outcome = await joinRoom(room.id, leaveCurrent);

    if (outcome === "conflict") {
      setConflictRoom(room);
      return;
    }

    const messages: Partial<Record<typeof outcome, string>> = {
      gone: "This room no longer exists.",
      full: "This room is full.",
      forbidden: "Your access to chat rooms has been revoked.",
      error: "Something went wrong. Try again.",
    };

    const message = messages[outcome];
    if (message) {
      setRowErrors((prev) => ({ ...prev, [room.id]: message }));
    }
  }

  return { rowErrors, conflictRoom, setConflictRoom, attemptJoin };
}
