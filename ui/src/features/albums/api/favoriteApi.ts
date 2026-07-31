import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

async function post(path: string): Promise<void> {
  const response = await apiFetch(path, { method: "POST" });
  if (!response.ok) {
    return throwMessageApiError(response);
  }
}

async function del(path: string): Promise<void> {
  const response = await apiFetch(path, { method: "DELETE" });
  if (!response.ok) {
    return throwMessageApiError(response);
  }
}

export function addFavoriteAlbum(albumId: number): Promise<void> {
  return post(`/favorites/albums/${albumId}`);
}

export function removeFavoriteAlbum(albumId: number): Promise<void> {
  return del(`/favorites/albums/${albumId}`);
}

export function addFavoriteSong(songId: number): Promise<void> {
  return post(`/favorites/songs/${songId}`);
}

export function removeFavoriteSong(songId: number): Promise<void> {
  return del(`/favorites/songs/${songId}`);
}
