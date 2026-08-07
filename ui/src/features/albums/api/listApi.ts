import type { PagedResponse } from "../../../types/api";
import type { UserListSummary } from "../../../types/list";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function getMyLists(
  page = 0,
  size = 50,
  albumId?: number,
): Promise<PagedResponse<UserListSummary>> {
  const albumParam = albumId !== undefined ? `&albumId=${albumId}` : "";
  return fetchJson(`/lists/me?page=${page}&size=${size}${albumParam}`);
}

export function createList(
  name: string,
): Promise<{ id: number; name: string }> {
  return fetchJson("/lists", {
    method: "POST",
    body: JSON.stringify({ name, description: null }),
  });
}

export function addAlbumToList(listId: number, albumId: number): Promise<void> {
  return fetchOk(`/lists/${listId}/albums/${albumId}`, { method: "POST" });
}
