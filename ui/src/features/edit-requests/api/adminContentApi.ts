import type { AlbumArtist, AlbumDetail, AlbumSong } from "../../albums/types";
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

export function updateAlbumTitle(
  albumId: number,
  title: string,
): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums/${albumId}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export function updateAlbumReleaseDate(
  albumId: number,
  currentTitle: string,
  releaseDate: string,
): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums/${albumId}`, {
    method: "PUT",
    body: JSON.stringify({ title: currentTitle, releaseDate }),
  });
}

export function searchAdminArtists(query: string): Promise<AlbumArtist[]> {
  return fetchJson(`/admin/artists/search?q=${encodeURIComponent(query)}`);
}

export function addAlbumArtist(
  albumId: number,
  artistId: number,
): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums/${albumId}/artists`, {
    method: "POST",
    body: JSON.stringify({ artistId }),
  });
}

export function removeAlbumArtist(
  albumId: number,
  artistId: number,
): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums/${albumId}/artists/${artistId}`, {
    method: "DELETE",
  });
}

export function searchAdminGenres(query: string): Promise<string[]> {
  return fetchJson(`/admin/genres/search?q=${encodeURIComponent(query)}`);
}

export function addAlbumGenre(
  albumId: number,
  genre: string,
): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums/${albumId}/genres`, {
    method: "POST",
    body: JSON.stringify({ genre }),
  });
}

export function removeAlbumGenre(
  albumId: number,
  genre: string,
): Promise<AlbumDetail> {
  return fetchJson(
    `/admin/albums/${albumId}/genres/${encodeURIComponent(genre)}`,
    { method: "DELETE" },
  );
}

export function addAlbumSong(
  albumId: number,
  position: number,
  title: string,
  durationSeconds: number,
): Promise<AlbumSong> {
  return fetchJson(`/admin/albums/${albumId}/songs`, {
    method: "POST",
    body: JSON.stringify({ position, title, durationSeconds }),
  });
}

export function updateSongPosition(
  songId: number,
  position: number,
): Promise<AlbumSong> {
  return fetchJson(`/admin/songs/${songId}`, {
    method: "PUT",
    body: JSON.stringify({ position }),
  });
}

export function updateSongTitle(
  songId: number,
  title: string,
): Promise<AlbumSong> {
  return fetchJson(`/admin/songs/${songId}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export function updateSongDuration(
  songId: number,
  currentTitle: string,
  durationSeconds: number,
): Promise<AlbumSong> {
  return fetchJson(`/admin/songs/${songId}`, {
    method: "PUT",
    body: JSON.stringify({ title: currentTitle, durationSeconds }),
  });
}

export function deleteSong(songId: number): Promise<void> {
  return fetchOk(`/admin/songs/${songId}`, { method: "DELETE" });
}

export function addSongArtist(
  songId: number,
  artistId: number,
): Promise<AlbumSong> {
  return fetchJson(`/admin/songs/${songId}/artists`, {
    method: "POST",
    body: JSON.stringify({ artistId }),
  });
}

export function removeSongArtist(
  songId: number,
  artistId: number,
): Promise<AlbumSong> {
  return fetchJson(`/admin/songs/${songId}/artists/${artistId}`, {
    method: "DELETE",
  });
}

export interface CreateAlbumSongPayload {
  title: string;
  durationSeconds: number;
  artistIds: number[];
}

export interface CreateAlbumPayload {
  title: string;
  releaseDate: string;
  description: string | null;
  artistIds: number[];
  genres: string[];
  songs: CreateAlbumSongPayload[];
}

export function createAlbum(payload: CreateAlbumPayload): Promise<AlbumDetail> {
  return fetchJson(`/admin/albums`, {
    method: "POST",
    body: JSON.stringify(payload),
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

export interface CreateArtistPayload {
  name: string;
  country: string;
  type: string;
  biography: string | null;
}

export function createArtist(
  payload: CreateArtistPayload,
): Promise<ArtistDetail> {
  return fetchJson(`/admin/artists`, {
    method: "POST",
    body: JSON.stringify(payload),
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

export function updateArtistName(
  artistId: number,
  name: string,
  currentCountry: string | null,
  currentType: string | null,
  currentBiography: string | null,
): Promise<ArtistDetail> {
  return fetchJson(`/admin/artists/${artistId}`, {
    method: "PUT",
    body: JSON.stringify({
      artistName: name,
      country: currentCountry,
      artistType: currentType,
      biography: currentBiography,
    }),
  });
}

export function updateArtistCountry(
  artistId: number,
  currentName: string,
  country: string,
  currentType: string | null,
  currentBiography: string | null,
): Promise<ArtistDetail> {
  return fetchJson(`/admin/artists/${artistId}`, {
    method: "PUT",
    body: JSON.stringify({
      artistName: currentName,
      country,
      artistType: currentType,
      biography: currentBiography,
    }),
  });
}

export function updateArtistType(
  artistId: number,
  currentName: string,
  currentCountry: string | null,
  type: string,
  currentBiography: string | null,
): Promise<ArtistDetail> {
  return fetchJson(`/admin/artists/${artistId}`, {
    method: "PUT",
    body: JSON.stringify({
      artistName: currentName,
      country: currentCountry,
      artistType: type,
      biography: currentBiography,
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
