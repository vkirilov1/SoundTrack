import { createContext } from "react";
import type {
  ChatMessage,
  ChatRoomInfo,
  CreateRoomPayload,
  JoinOutcome,
} from "../types";

export type ChatEndReason = "closed" | "kicked" | "declined";

export type ChatPhase =
  | { kind: "idle" }
  | { kind: "pending"; room: ChatRoomInfo }
  | { kind: "active"; room: ChatRoomInfo }
  | { kind: "ended"; roomName: string; reason: ChatEndReason };

export interface ChatContextValue {
  phase: ChatPhase;
  room: ChatRoomInfo | null;
  messages: ChatMessage[];
  connected: boolean;
  expanded: boolean;
  unseenCount: number;
  setExpanded: (expanded: boolean) => void;
  joinRoom: (roomId: number, leaveCurrent?: boolean) => Promise<JoinOutcome>;
  createRoom: (payload: CreateRoomPayload) => Promise<void>;
  leave: () => Promise<void>;
  cancelPending: () => Promise<void>;
  sendMessage: (content: string) => void;
  kick: (userId: number) => Promise<void>;
  approve: (userId: number) => Promise<void>;
  decline: (userId: number) => Promise<void>;
  invite: (userId: number) => Promise<void>;
  dismissEnded: () => void;
}

export const ChatContext = createContext<ChatContextValue | undefined>(
  undefined,
);
