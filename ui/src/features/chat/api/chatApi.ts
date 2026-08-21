import type { PagedResponse } from "../../../types/api";
import type {
  ChatMessage,
  ChatRoomInfo,
  CreateRoomPayload,
  JoinRoomResult,
} from "../types";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function getRooms(): Promise<ChatRoomInfo[]> {
  return fetchJson("/chat/rooms");
}

/** 404s when the caller is not currently in any room. */
export function getMyRoom(): Promise<ChatRoomInfo> {
  return fetchJson("/chat/rooms/me");
}

export function getRoom(roomId: number): Promise<ChatRoomInfo> {
  return fetchJson(`/chat/rooms/${roomId}`);
}

export function createRoom(payload: CreateRoomPayload): Promise<ChatRoomInfo> {
  return fetchJson("/chat/rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinRoom(roomId: number): Promise<JoinRoomResult> {
  return fetchJson(`/chat/rooms/${roomId}/join`, { method: "POST" });
}

export function leaveRoom(roomId: number): Promise<void> {
  return fetchOk(`/chat/rooms/${roomId}/leave`, { method: "DELETE" });
}

export function kickMember(roomId: number, userId: number): Promise<void> {
  return fetchOk(`/chat/rooms/${roomId}/kick/${userId}`, { method: "POST" });
}

export function inviteUser(roomId: number, userId: number): Promise<void> {
  return fetchOk(`/chat/rooms/${roomId}/invite`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function approveRequest(roomId: number, userId: number): Promise<void> {
  return fetchOk(`/chat/rooms/${roomId}/requests/${userId}/approve`, {
    method: "POST",
  });
}

export function declineRequest(roomId: number, userId: number): Promise<void> {
  return fetchOk(`/chat/rooms/${roomId}/requests/${userId}`, {
    method: "DELETE",
  });
}

export function getMessages(
  roomId: number,
  page = 0,
  size = 50,
): Promise<PagedResponse<ChatMessage>> {
  return fetchJson(`/chat/rooms/${roomId}/messages?page=${page}&size=${size}`);
}
