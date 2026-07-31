import type { AlbumReview, CreateAlbumReviewRequest } from "../types";
import type { PagedResponse } from "../../../types/api";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

export async function getAlbumReviews(
  albumId: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumReview>> {
  const response = await apiFetch(
    `/albums/${albumId}/reviews?page=${page}&size=${size}`,
  );

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<PagedResponse<AlbumReview>>;
}

export async function createAlbumReview(
  albumId: number,
  payload: CreateAlbumReviewRequest,
): Promise<AlbumReview> {
  const response = await apiFetch(`/albums/${albumId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<AlbumReview>;
}

export async function updateAlbumReview(
  albumId: number,
  reviewId: number,
  payload: CreateAlbumReviewRequest,
): Promise<AlbumReview> {
  const response = await apiFetch(`/albums/${albumId}/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<AlbumReview>;
}

export async function deleteAlbumReview(
  albumId: number,
  reviewId: number,
): Promise<void> {
  const response = await apiFetch(`/albums/${albumId}/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }
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
