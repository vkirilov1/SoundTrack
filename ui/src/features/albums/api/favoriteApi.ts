import { fetchOk } from "../../../lib/api-client";

export function addFavoriteAlbum(albumId: number): Promise<void> {
  return fetchOk(`/favorites/albums/${albumId}`, { method: "POST" });
}

export function removeFavoriteAlbum(albumId: number): Promise<void> {
  return fetchOk(`/favorites/albums/${albumId}`, { method: "DELETE" });
}

export function addFavoriteSong(songId: number): Promise<void> {
  return fetchOk(`/favorites/songs/${songId}`, { method: "POST" });
}

export function removeFavoriteSong(songId: number): Promise<void> {
  return fetchOk(`/favorites/songs/${songId}`, { method: "DELETE" });
}
