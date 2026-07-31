import type { UserProfile, FieldErrors } from "../../../types/auth";
import type { PagedResponse } from "../../../types/api";
import type { UserListSummary } from "../../../types/list";
import type { FavoriteAlbum, FavoriteSong, UserReview } from "../types";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  if (response.status === 400) {
    throw new ApiError(
      response.status,
      "Please fix the highlighted fields.",
      body as FieldErrors,
    );
  }

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

async function getJson<T>(path: string): Promise<T> {
  const response = await apiFetch(path);

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<T>;
}

export function getUserProfile(userId: number): Promise<UserProfile> {
  return getJson(`/users/${userId}`);
}

export function getUserLists(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<UserListSummary>> {
  return getJson(`/lists/user/${userId}?page=${page}&size=${size}`);
}

export function getUserFavoriteAlbums(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<FavoriteAlbum>> {
  return getJson(`/favorites/albums/user/${userId}?page=${page}&size=${size}`);
}

export function getUserFavoriteSongs(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<FavoriteSong>> {
  return getJson(`/favorites/songs/user/${userId}?page=${page}&size=${size}`);
}

export function getUserReviews(
  userId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<UserReview>> {
  return getJson(`/users/${userId}/reviews?page=${page}&size=${size}`);
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
    return throwApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function uploadProfilePhoto(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch("/users/me/photo", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}

export async function resetProfilePhoto(): Promise<UserProfile> {
  const response = await apiFetch("/users/me/photo", { method: "DELETE" });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<UserProfile>;
}
