import type { AlbumDetail } from "../../albums/types";
import type { ArtistDetail } from "../../artists/types";
import { ApiError } from "../../../lib/api-error";
import { apiFetch } from "../../../lib/api-client";

async function throwMessageApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => ({}));

  throw new ApiError(
    response.status,
    (body as { message?: string }).message ?? "Request failed.",
  );
}

export async function updateAlbumDescription(
  albumId: number,
  currentTitle: string,
  description: string,
): Promise<AlbumDetail> {
  const response = await apiFetch(`/admin/albums/${albumId}`, {
    method: "PUT",
    body: JSON.stringify({ title: currentTitle, description }),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<AlbumDetail>;
}

export async function uploadAlbumPhoto(
  albumId: number,
  file: File,
): Promise<AlbumDetail> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`/admin/albums/${albumId}/photo`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<AlbumDetail>;
}

export async function updateArtistDescription(
  artistId: number,
  currentName: string,
  currentCountry: string | null,
  currentType: string | null,
  biography: string,
): Promise<ArtistDetail> {
  const response = await apiFetch(`/admin/artists/${artistId}`, {
    method: "PUT",
    body: JSON.stringify({
      artistName: currentName,
      country: currentCountry,
      artistType: currentType,
      biography,
    }),
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<ArtistDetail>;
}

export async function uploadArtistPhoto(
  artistId: number,
  file: File,
): Promise<ArtistDetail> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(`/admin/artists/${artistId}/photo`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }

  return response.json() as Promise<ArtistDetail>;
}

export async function deleteReviewAsAdmin(reviewId: number): Promise<void> {
  const response = await apiFetch(`/admin/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    return throwMessageApiError(response);
  }
}
