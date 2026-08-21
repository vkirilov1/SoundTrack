import type { PagedResponse } from "../../../../types/api";
import { fetchJson, fetchOk } from "../../../../lib/api-client";
import type { ChatReport, ChatReportDetail } from "../types";

export function getChatReports(
  page = 0,
  size = 20,
): Promise<PagedResponse<ChatReport>> {
  return fetchJson(`/admin/chat/reports?page=${page}&size=${size}`);
}

export function getChatReportDetail(
  reportId: number,
): Promise<ChatReportDetail> {
  return fetchJson(`/admin/chat/reports/${reportId}`);
}

export function dismissChatReport(reportId: number): Promise<ChatReport> {
  return fetchJson(`/admin/chat/reports/${reportId}/dismiss`, {
    method: "POST",
  });
}

export function deleteChatRoom(roomId: number): Promise<void> {
  return fetchOk(`/admin/chat/rooms/${roomId}/delete`, { method: "POST" });
}

export function revokeChatAccess(userId: number): Promise<void> {
  return fetchOk(`/admin/chat/users/${userId}/revoke`, { method: "POST" });
}

export function restoreChatAccess(userId: number): Promise<void> {
  return fetchOk(`/admin/chat/users/${userId}/restore`, { method: "POST" });
}
