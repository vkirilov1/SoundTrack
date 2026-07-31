import type { PagedResponse } from "../../../types/api";
import type { UserListSummary } from "../../../types/list";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

export async function getMyLists(
  page = 0,
  size = 50,
  albumId?: number,
): Promise<PagedResponse<UserListSummary>> {
  const albumParam = albumId !== undefined ? `&albumId=${albumId}` : "";
  const response = await apiFetch(
    `/lists/me?page=${page}&size=${size}${albumParam}`,
  );

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<PagedResponse<UserListSummary>>;
}

export async function createList(
  name: string,
): Promise<{ id: number; name: string }> {
  const response = await apiFetch("/lists", {
    method: "POST",
    body: JSON.stringify({ name, description: null }),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  // Backend returns the full UserListDetailResponse; we only need id/name here.
  return response.json() as Promise<{ id: number; name: string }>;
}

export async function addAlbumToList(
  listId: number,
  albumId: number,
): Promise<void> {
  const response = await apiFetch(`/lists/${listId}/albums/${albumId}`, {
    method: "POST",
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }
}
