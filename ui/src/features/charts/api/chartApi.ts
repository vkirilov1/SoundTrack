import type { PagedResponse } from "../../../types/api";
import { fetchJson } from "../../../lib/api-client";
import type { AlbumSummary } from "../../../types/album";
import type { ChartSortField } from "../types";

export function getTopAlbumsForYear(
  year: number,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  return fetchJson(`/albums/year/${year}?page=${page}&size=${size}`);
}

export function getTopAlbumsOverall(
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  return fetchJson(`/albums/overall?page=${page}&size=${size}`);
}

export function getAvailableYears(): Promise<number[]> {
  return fetchJson(`/albums/years`);
}

export function getRecentlyAdded(
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  return fetchJson(`/albums/recent?page=${page}&size=${size}`);
}

export function getAlbumsByGenre(
  genre: string,
  sort: ChartSortField,
  descending: boolean,
  artistId: number | null,
  page = 0,
  size = 20,
): Promise<PagedResponse<AlbumSummary>> {
  const params = new URLSearchParams({
    sort,
    descending: String(descending),
    page: String(page),
    size: String(size),
  });
  if (artistId !== null) {
    params.set("artistId", String(artistId));
  }
  return fetchJson(`/albums/genre/${encodeURIComponent(genre)}?${params}`);
}
