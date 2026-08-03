import type { AlbumDetail } from "../../albums/types";
import type { ArtistDetail } from "../../artists/types";
import type { UserProfile } from "../../../types/auth";
import { fetchJson, fetchOk } from "../../../lib/api-client";

export function updateAlbumDescription(
  albumId: number,
  currentTitle: string,
  description: string,
): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums/${albumId}`, {
    method: "PUT",
    body: JSON.stringify({ title: currentTitle, description }),
  });
}

export function uploadAlbumPhoto(
  albumId: number,
  file: File,
): Promise<AlbumDetail> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchJson(`/admin/albums/${albumId}/photo`, {
    method: "POST",
    body: formData,
  });
}

export function updateArtistDescription(
  artistId: number,
  currentName: string,
  currentCountry: string | null,
  currentType: string | null,
  biography: string,
): Promise<ArtistDetail> {
  return fetchJson(`/admin/artists/${artistId}`, {
    method: "PUT",
    body: JSON.stringify({
      artistName: currentName,
      country: currentCountry,
      artistType: currentType,
      biography,
    }),
  });
}

export function uploadArtistPhoto(
  artistId: number,
  file: File,
): Promise<ArtistDetail> {
  const formData = new FormData();
  formData.append("file", file);

  return fetchJson(`/admin/artists/${artistId}/photo`, {
    method: "POST",
    body: formData,
  });
}

export function deleteReviewAsAdmin(reviewId: number): Promise<void> {
  return fetchOk(`/admin/reviews/${reviewId}`, { method: "DELETE" });
}

export function resetUserPhotoAsAdmin(userId: number): Promise<UserProfile> {
  return fetchJson(`/admin/users/${userId}/photo`, { method: "DELETE" });
}
