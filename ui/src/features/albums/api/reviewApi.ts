import type { AlbumReview, CreateAlbumReviewRequest } from "../types";
import type { PagedResponse } from "../../../types/api";
import { apiFetch, fetchJson, fetchOk } from "../../../lib/api-client";
import { throwMessageApiError } from "../../../lib/api-error";

export function getAlbumReviews(
  albumId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumReview>> {
  return fetchJson(`/albums/${albumId}/reviews?page=${page}&size=${size}`);
}

export function createAlbumReview(
  albumId: number,
  payload: CreateAlbumReviewRequest,
): Promise<AlbumReview> {
  return fetchJson(`/albums/${albumId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAlbumReview(
  albumId: number,
  reviewId: number,
  payload: CreateAlbumReviewRequest,
): Promise<AlbumReview> {
  return fetchJson(`/albums/${albumId}/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAlbumReview(
  albumId: number,
  reviewId: number,
): Promise<void> {
  return fetchOk(`/albums/${albumId}/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

/** Returns the current user's own review for this album, or null if they haven't reviewed it. */
export async function getMyReview(
  albumId: number,
): Promise<AlbumReview | null> {
  const response = await apiFetch(`/albums/${albumId}/reviews/me`);

  if (response.status === 404 || response.status === 401) {
    return null;
  }
  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<AlbumReview>;
}
