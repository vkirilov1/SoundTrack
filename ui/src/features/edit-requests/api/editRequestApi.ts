import type { PagedResponse } from "../../../types/api";
import type { EditRequest, EditRequestTargetType } from "../types";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function submitEditRequest(
  targetType: EditRequestTargetType,
  targetId: number,
  description: string,
): Promise<void> {
  const path =
    targetType === "ALBUM"
      ? `/edit-requests/albums/${targetId}`
      : `/edit-requests/artists/${targetId}`;

  return fetchOk(path, {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export function getEditRequests(
  page = 0,
  size = 20,
): Promise<PagedResponse<EditRequest>> {
  return fetchJson(`/admin/edit-requests?page=${page}&size=${size}`);
}

export function approveEditRequest(id: number): Promise<EditRequest> {
  return fetchJson(`/admin/edit-requests/${id}/approve`, { method: "POST" });
}

export function rejectEditRequest(id: number): Promise<EditRequest> {
  return fetchJson(`/admin/edit-requests/${id}/reject`, { method: "POST" });
}
