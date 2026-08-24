import type { UserProfile } from "../../../types/auth";
import type { PagedResponse } from "../../../types/api";
import type { UserListSummary } from "../../../types/list";
import type { AlbumSummary } from "../../../types/album";
import type { FavoriteSong, UserReview } from "../types";
import { apiFetch, fetchJson, fetchOk } from "../../../lib/api-client";
import { throwFieldApiError } from "../../../lib/api-error";

export function getUserProfile(userId: number): Promise<UserProfile> {
  return fetchJson(`/users/${userId}`);
}

export function getUserLists(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<UserListSummary>> {
  return fetchJson(`/lists/user/${userId}?page=${page}&size=${size}`);
}

export function getUserFavoriteAlbums(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  return fetchJson(
    `/favorites/albums/user/${userId}?page=${page}&size=${size}`,
  );
}

export function getUserFavoriteSongs(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<FavoriteSong>> {
  return fetchJson(`/favorites/songs/user/${userId}?page=${page}&size=${size}`);
}

export function getUserReviews(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<UserReview>> {
  return fetchJson(`/users/${userId}/reviews?page=${page}&size=${size}`);
}

export async function updateProfile(payload: {
  username: string;
  bio: string;
}): Promise<UserProfile> {
  const response = await apiFetch("/users/me/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwFieldApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export function uploadProfilePhoto(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchJson("/users/me/photo", { method: "POST", body: formData });
}

export function resetProfilePhoto(): Promise<UserProfile> {
  return fetchJson("/users/me/photo", { method: "DELETE" });
}

export function deleteAccount(password: string): Promise<void> {
  return fetchOk("/users/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}
