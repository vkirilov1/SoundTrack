import type { PagedResponse } from "../../../types/api";
import type { UserListDetail, UserListSummary } from "../../../types/list";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function getList(listId: number): Promise<UserListDetail> {
  return fetchJson(`/lists/${listId}`);
}

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

export function updateListName(
  listId: number,
  name: string,
  currentDescription: string | null,
): Promise<UserListDetail> {
  return fetchJson(`/lists/${listId}`, {
    method: "PUT",
    body: JSON.stringify({ name, description: currentDescription }),
  });
}

export function updateListDescription(
  listId: number,
  currentName: string,
  description: string,
): Promise<UserListDetail> {
  return fetchJson(`/lists/${listId}`, {
    method: "PUT",
    body: JSON.stringify({ name: currentName, description }),
  });
}

export function addAlbumToList(listId: number, albumId: number): Promise<void> {
  return fetchOk(`/lists/${listId}/albums/${albumId}`, { method: "POST" });
}

export function removeAlbumFromList(
  listId: number,
  albumId: number,
): Promise<void> {
  return fetchOk(`/lists/${listId}/albums/${albumId}`, { method: "DELETE" });
}

export function deleteList(listId: number): Promise<void> {
  return fetchOk(`/lists/${listId}`, { method: "DELETE" });
}
