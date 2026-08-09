import type { PagedResponse } from "../../../types/api";
import type { AppNotification } from "../types";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function getNotifications(
  page = 0,
  size = 20,
): Promise<PagedResponse<AppNotification>> {
  return fetchJson(`/notifications?page=${page}&size=${size}`);
}

export function getUnreadCount(): Promise<number> {
  return fetchJson("/notifications/unread-count");
}

export function clearNotifications(): Promise<void> {
  return fetchOk("/notifications", { method: "DELETE" });
}
