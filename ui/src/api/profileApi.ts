import type { UserProfile } from "../types/auth";
import type {
  FavoriteAlbum,
  FavoriteSong,
  PagedResponse,
  UserListSummary,
  UserReview,
} from "../types/profile";
import { ApiError } from "./ApiError";
import { apiFetch } from "./httpClient";

async function getJson<T>(path: string): Promise<T> {
  const response = await apiFetch(path);

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (body as { message?: string }).message ?? "Request failed.",
    );
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
